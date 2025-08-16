#!/bin/bash

# Script completo de despliegue para EC2
# Ejecutar directamente en la instancia EC2

echo "🚀 Iniciando despliegue completo de Kimera en EC2..."
echo "⏰ Fecha: $(date)"
echo ""

# Verificar que estamos en EC2
if [ ! -f /etc/system-release ]; then
    echo "❌ Error: Este script debe ejecutarse en una instancia EC2"
    exit 1
fi

echo "✅ Confirmado: Ejecutando en instancia EC2"
echo ""

# Actualizar sistema
echo "📦 Actualizando sistema..."
sudo yum update -y
echo "✅ Sistema actualizado"
echo ""

# Instalar nginx
echo "🌐 Instalando nginx..."
sudo yum install nginx -y
echo "✅ Nginx instalado"
echo ""

# Habilitar y iniciar nginx
echo "▶️ Iniciando nginx..."
sudo systemctl enable nginx
sudo systemctl start nginx
echo "✅ Nginx iniciado y habilitado"
echo ""

# Crear directorio para la aplicación
echo "📁 Creando directorio de la aplicación..."
sudo mkdir -p /var/www/kimera
echo "✅ Directorio creado: /var/www/kimera"
echo ""

# Verificar que los archivos estén disponibles
if [ -d "kimera" ]; then
    echo "📋 Copiando archivos de la aplicación..."
    sudo cp -r kimera/* /var/www/kimera/
    echo "✅ Archivos copiados"
else
    echo "❌ Error: No se encontró la carpeta 'kimera'"
    echo "📋 Descargando archivos desde GitHub..."
    cd /tmp
    sudo yum install git -y
    git clone https://github.com/Daniel-orona21/kimera.git
    sudo cp -r kimera/dist/kimera/* /var/www/kimera/
    echo "✅ Archivos descargados y copiados"
fi

echo ""

# Configurar nginx
echo "⚙️ Configurando nginx..."
if [ -f "nginx.conf" ]; then
    sudo cp nginx.conf /etc/nginx/conf.d/kimera.conf
else
    # Crear configuración por defecto si no existe
    sudo tee /etc/nginx/conf.d/kimera.conf > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    root /var/www/kimera;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Angular routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
fi

echo "✅ Configuración de nginx creada"
echo ""

# Verificar configuración de nginx
echo "🔍 Verificando configuración de nginx..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Configuración de nginx válida"
else
    echo "❌ Error en configuración de nginx"
    exit 1
fi

# Recargar nginx
echo "🔄 Recargando nginx..."
sudo systemctl reload nginx
echo "✅ Nginx recargado"
echo ""

# Configurar firewall
echo "🔥 Configurando firewall..."
if command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
    echo "✅ Firewall configurado"
else
    echo "⚠️ Firewall no disponible, saltando..."
fi
echo ""

# Configurar permisos
echo "🔐 Configurando permisos..."
sudo chown -R nginx:nginx /var/www/kimera
sudo chmod -R 755 /var/www/kimera
echo "✅ Permisos configurados"
echo ""

# Verificar estado del servicio
echo "📊 Estado del servicio nginx:"
sudo systemctl status nginx --no-pager
echo ""

# Verificar que la aplicación esté funcionando
echo "🌐 Verificando que la aplicación esté funcionando..."
if curl -s http://localhost > /dev/null; then
    echo "✅ Aplicación funcionando correctamente"
else
    echo "❌ Error: La aplicación no responde"
fi
echo ""

# Obtener IP pública
echo "🌍 Información de acceso:"
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
if [ ! -z "$PUBLIC_IP" ]; then
    echo "🌐 URL pública: http://$PUBLIC_IP"
else
    echo "🌐 IP pública: No disponible (verificar en consola AWS)"
fi
echo "📁 Archivos de la aplicación en: /var/www/kimera"
echo "📝 Logs de nginx en: /var/log/nginx/"
echo ""

# Comandos útiles
echo "🛠️ Comandos útiles:"
echo "  - Ver logs: sudo tail -f /var/log/nginx/error.log"
echo "  - Reiniciar nginx: sudo systemctl restart nginx"
echo "  - Estado del servicio: sudo systemctl status nginx"
echo "  - Verificar configuración: sudo nginx -t"
echo ""

echo "🎉 ¡Despliegue completado exitosamente!"
echo "🚀 Tu aplicación Kimera está funcionando en EC2"
