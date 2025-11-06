# Usando imagem oficial do PHP com Apache
FROM php:8.2-apache

# Instala dependências necessárias para PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev git unzip && docker-php-ext-install pdo pdo_pgsql pgsql

# Copia todos os arquivos do projeto para o container
COPY . /var/www/html/

# Ajusta permissões (opcional, mas ajuda)
RUN chown -R www-data:www-data /var/www/html/

# Expõe a porta padrão do Apache
EXPOSE 80

# Apache inicia automaticamente (já acontece na imagem oficial)
