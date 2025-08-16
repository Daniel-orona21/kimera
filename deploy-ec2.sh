#!/bin/bash

# Script de despliegue para EC2
# Ejecutar como usuario con permisos sudo

echo "🚀 Iniciando despliegue de Kimera en EC2..."

# Actualizar sistema
echo "📦 Actualizando sistema..."
sudo yum update -y

# Instalar nginx
echo "🌐 Instalando nginx..."
sudo yum install nginx -y

# Habilitar y iniciar nginx
echo "▶️ Iniciando nginx..."
sudo systemctl enable nginx
sudo systemctl start nginx

# Crear directorio para la aplicación
echo "📁 Creando directorio de la aplicación..."
sudo mkdir -p /var/www/kimera

# Copiar archivos de la aplicación (asumiendo que están en el directorio actual)
echo "📋 Copiando archivos de la aplicación..."
sudo cp -r dist/kimera/* /var/www/kimera/

# Configurar nginx
echo "⚙️ Configurando nginx..."
sudo cp nginx.conf /etc/nginx/conf.d/kimera.conf

# Verificar configuración de nginx
echo "🔍 Verificando configuración de nginx..."
sudo nginx -t

# Recargar nginx
echo "🔄 Recargando nginx..."
sudo systemctl reload nginx

# Configurar firewall (si está habilitado)
echo "🔥 Configurando firewall..."
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Verificar estado del servicio
echo "📊 Estado del servicio nginx:"
sudo systemctl status nginx --no-pager

echo "✅ Despliegue completado!"
echo "🌍 Tu aplicación debería estar disponible en: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "📁 Archivos de la aplicación en: /var/www/kimera"
echo "📝 Logs de nginx en: /var/log/nginx/"
