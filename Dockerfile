# Usando imagem oficial do PHP com Apache
FROM php:8.2-apache

# Instala dependências necessárias para PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev git unzip && docker-php-ext-install pdo pdo_pgsql pgsql

# Copia apenas a pasta app para o root do Apache
COPY ./app/ /var/www/html/

# Ajusta permissões
RUN chown -R www-data:www-data /var/www/html/

# Expõe a porta 80
EXPOSE 80
