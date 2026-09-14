# Etapa de construcción
FROM oven/bun:1 as builder

WORKDIR /app

# Copiar los archivos de dependencias
COPY package.json bun.lockb ./

# Instalar dependencias de forma reproducible
RUN bun install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN bun run build

# Etapa de producción
FROM nginx:alpine

# Copiar la configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos desde la etapa de builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Verificar que Nginx responde antes de marcar el contenedor como saludable
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD ["wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:80"]

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
