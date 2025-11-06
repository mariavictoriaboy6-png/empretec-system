# Usando imagem oficial do PHP com Apache
FROM php:8.2-apache

# Copia todos os arquivos para o diretório padrão do Apache
COPY . /var/www/html/

# Habilita extensões necessárias para PostgreSQL
RUN docker-php-ext-install pdo pdo_pgsql pgsql

# Expõe a porta padrão do Apache
EXPOSE 80

# Apache inicia automaticamente
