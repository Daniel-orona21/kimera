# 🚀 Guía de Despliegue en EC2

## Requisitos Previos

- Instancia EC2 con Amazon Linux 2 o Ubuntu
- Acceso SSH a la instancia
- Grupo de seguridad configurado para permitir tráfico HTTP (puerto 80) y HTTPS (puerto 443)

## Pasos de Despliegue

### 1. Conectar a tu instancia EC2
```bash
ssh -i tu-key.pem ec2-user@tu-ip-publica
```

### 2. Subir archivos a EC2
```bash
# Desde tu máquina local
scp -i tu-key.pem -r dist/kimera ec2-user@tu-ip-publica:~/
scp -i tu-key.pem nginx.conf ec2-user@tu-ip-publica:~/
scp -i tu-key.pem deploy-ec2.sh ec2-user@tu-ip-publica:~/
```

### 3. Ejecutar script de despliegue
```bash
# En la instancia EC2
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

### 4. Verificar despliegue
```bash
# Verificar estado de nginx
sudo systemctl status nginx

# Verificar logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Verificar que la aplicación esté funcionando
curl http://localhost
```

## Configuración del Grupo de Seguridad

Asegúrate de que tu grupo de seguridad permita:
- **SSH (puerto 22)**: Para acceso remoto
- **HTTP (puerto 80)**: Para tráfico web
- **HTTPS (puerto 443)**: Para tráfico seguro (opcional)

## Comandos Útiles

### Reiniciar nginx
```bash
sudo systemctl restart nginx
```

### Ver logs en tiempo real
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Verificar configuración
```bash
sudo nginx -t
```

### Actualizar aplicación
```bash
# Después de hacer un nuevo build
sudo cp -r dist/kimera/* /var/www/kimera/
sudo systemctl reload nginx
```

## Solución de Problemas

### Si nginx no inicia
```bash
sudo nginx -t  # Verificar configuración
sudo journalctl -u nginx  # Ver logs del sistema
```

### Si la aplicación no carga
```bash
# Verificar permisos
sudo chown -R nginx:nginx /var/www/kimera
sudo chmod -R 755 /var/www/kimera

# Verificar logs
sudo tail -f /var/log/nginx/error.log
```

### Si necesitas HTTPS
```bash
# Instalar certbot para Let's Encrypt
sudo yum install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tu-dominio.com
```

## Estructura de Archivos en EC2

```
/var/www/kimera/
├── index.html
├── main-*.js
├── polyfills-*.js
├── styles-*.css
└── assets/
    └── images/
```

## Monitoreo

- **Estado del servicio**: `sudo systemctl status nginx`
- **Uso de recursos**: `htop` o `top`
- **Espacio en disco**: `df -h`
- **Logs de acceso**: `/var/log/nginx/access.log`
