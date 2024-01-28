FROM ubuntu:latest

WORKDIR /app

COPY . .

RUN pip install --upgrade pip && pip install .

EXPOSE 5000/http

ENTRYPOINT ["gagpasta"]