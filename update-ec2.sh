#!/bin/bash

# Script de actualización para EC2
# Ejecutar en tu máquina local después de hacer push

echo "🚀 Actualizando aplicación Kimera en EC2..."

# Variables
EC2_IP="44.220.130.42"
KEY_FILE="instancia.pem"
REPO_URL="https://github.com/Daniel-orona21/kimera.git"

# 1. Hacer build de producción
echo "📦 Haciendo build de producción..."
ng build --configuration production

if [ $? -ne 0 ]; then
    echo "❌ Error en el build. Abortando actualización."
    exit 1
fi

echo "✅ Build completado exitosamente"

# 2. Subir archivos a EC2
echo "📤 Subiendo archivos a EC2..."
scp -i $KEY_FILE -r dist/kimera ec2-user@$EC2_IP:~/

if [ $? -ne 0 ]; then
    echo "❌ Error subiendo archivos. Abortando actualización."
    exit 1
fi

echo "✅ Archivos subidos exitosamente"

# 3. Ejecutar actualización en EC2
echo "🔄 Ejecutando actualización en EC2..."
ssh -i $KEY_FILE ec2-user@$EC2_IP << 'EOF'
echo "📋 Actualizando archivos de la aplicación..."
sudo cp -r kimera/* /var/www/kimera/
sudo chown -R nginx:nginx /var/www/kimera
sudo chmod -R 755 /var/www/kimera

echo "🔄 Recargando nginx..."
sudo systemctl reload nginx

echo "✅ Aplicación actualizada exitosamente"
echo "🌐 Disponible en: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
EOF

echo "🎉 ¡Actualización completada!"
echo "🌐 Tu aplicación está disponible en: http://$EC2_IP"
