#!/usr/bin/env python3
"""Deploy a tagged Biblia Online image through the local Portainer API."""

from __future__ import annotations

import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


RELEASE_TAG_PATTERN = re.compile(r"^v[0-9]+\.[0-9]+\.[0-9]+$")
TEMPLATE_PLACEHOLDER = "__IMAGE_TAG__"
PORTAINER_TIMEOUT_SECONDS = 30
HEALTH_REQUEST_TIMEOUT_SECONDS = 10
HEALTH_TOTAL_TIMEOUT_SECONDS = 180
HEALTH_RETRY_SECONDS = 5


class DeploymentError(RuntimeError):
    """Raised when deployment configuration or verification fails."""


def required_environment(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise DeploymentError(f"Required environment variable {name} is not set.")
    return value


def positive_integer_environment(name: str) -> int:
    value = required_environment(name)
    try:
        parsed = int(value)
    except ValueError as error:
        raise DeploymentError(f"{name} must be a positive integer.") from error
    if parsed <= 0:
        raise DeploymentError(f"{name} must be a positive integer.")
    return parsed


def validate_http_url(name: str, value: str) -> str:
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise DeploymentError(f"{name} must be an absolute HTTP(S) URL.")
    if parsed.username or parsed.password:
        raise DeploymentError(f"{name} must not contain credentials.")
    if parsed.query or parsed.fragment:
        raise DeploymentError(f"{name} must not contain a query string or fragment.")
    return value.rstrip("/")


def materialize_stack_file(release_tag: str) -> str:
    if not RELEASE_TAG_PATTERN.fullmatch(release_tag):
        raise DeploymentError("DEPLOY_IMAGE_TAG must use the vX.Y.Z format.")

    template_path = Path(__file__).with_name("biblia-online.compose.yml.tmpl")
    try:
        template = template_path.read_text(encoding="utf-8")
    except OSError as error:
        raise DeploymentError("Unable to read the deployment template.") from error

    if template.count(TEMPLATE_PLACEHOLDER) != 1:
        raise DeploymentError("Deployment template must contain exactly one image-tag placeholder.")

    stack_file = template.replace(TEMPLATE_PLACEHOLDER, release_tag)
    if TEMPLATE_PLACEHOLDER in stack_file or ":latest" in stack_file:
        raise DeploymentError("Materialized stack file contains an unsafe image reference.")
    return stack_file


def update_portainer_stack(
    portainer_url: str,
    api_key: str,
    stack_id: int,
    endpoint_id: int,
    stack_file: str,
) -> None:
    payload = json.dumps(
        {
            "StackFileContent": stack_file,
            "Prune": False,
            "RepullImageAndRedeploy": True,
        }
    ).encode("utf-8")
    request = Request(
        f"{portainer_url}/api/stacks/{stack_id}?endpointId={endpoint_id}",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "X-API-Key": api_key,
        },
        method="PUT",
    )
    try:
        with urlopen(request, timeout=PORTAINER_TIMEOUT_SECONDS) as response:
            if not 200 <= response.status < 300:
                raise DeploymentError(f"Portainer stack update returned HTTP {response.status}.")
    except HTTPError as error:
        raise DeploymentError(f"Portainer stack update failed with HTTP {error.code}.") from error
    except URLError as error:
        raise DeploymentError("Portainer stack update could not reach the configured API.") from error
    except TimeoutError as error:
        raise DeploymentError("Portainer stack update timed out.") from error


def verify_health(health_url: str) -> None:
    deadline = time.monotonic() + HEALTH_TOTAL_TIMEOUT_SECONDS
    last_error = "no response received"

    while time.monotonic() < deadline:
        request = Request(health_url, method="GET")
        try:
            with urlopen(request, timeout=HEALTH_REQUEST_TIMEOUT_SECONDS) as response:
                if 200 <= response.status < 300:
                    print("Deployment health check passed.")
                    return
                last_error = f"HTTP {response.status}"
        except HTTPError as error:
            last_error = f"HTTP {error.code}"
        except URLError:
            last_error = "connection error"
        except TimeoutError:
            last_error = "request timed out"

        remaining = deadline - time.monotonic()
        if remaining > 0:
            time.sleep(min(HEALTH_RETRY_SECONDS, remaining))

    raise DeploymentError(
        "Deployment health check did not receive a 2xx response before the "
        f"{HEALTH_TOTAL_TIMEOUT_SECONDS}-second limit ({last_error})."
    )


def main() -> int:
    try:
        portainer_url = validate_http_url(
            "PORTAINER_URL", required_environment("PORTAINER_URL")
        )
        health_url = validate_http_url(
            "DEPLOY_HEALTH_URL", required_environment("DEPLOY_HEALTH_URL")
        )
        api_key = required_environment("PORTAINER_API_KEY")
        release_tag = required_environment("DEPLOY_IMAGE_TAG")
        stack_id = positive_integer_environment("PORTAINER_STACK_ID")
        endpoint_id = positive_integer_environment("PORTAINER_ENDPOINT_ID")
        stack_file = materialize_stack_file(release_tag)

        print(f"Updating Portainer stack {stack_id} with image tag {release_tag}.")
        update_portainer_stack(portainer_url, api_key, stack_id, endpoint_id, stack_file)
        print("Portainer stack update accepted; waiting for the public health endpoint.")
        verify_health(health_url)
        return 0
    except DeploymentError as error:
        print(f"Deployment failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
