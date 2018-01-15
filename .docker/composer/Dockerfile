FROM composer/composer:master

RUN apt-get update &&\
    apt-get install -y --force-yes\
    libicu-dev\
    libxml2-dev\
    libpcre3-dev\
    libfreetype6-dev \
    libjpeg62-turbo-dev\
    libmcrypt-dev\
    libpng12-dev

RUN pecl install redis &&\
    docker-php-ext-enable redis &&\
    docker-php-ext-install -j$(nproc) pdo_mysql &&\
    pecl install oauth-2.0.2 &&\
    docker-php-ext-enable oauth &&\
    docker-php-ext-install -j$(nproc) intl &&\
    docker-php-ext-install -j$(nproc) xmlrpc &&\
    docker-php-ext-install -j$(nproc) soap &&\
    docker-php-ext-install -j$(nproc) opcache &&\
    docker-php-ext-install -j$(nproc) iconv mcrypt &&\
    docker-php-ext-configure gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/ &&\
    docker-php-ext-install -j$(nproc) gd &&\
    apt-get clean

