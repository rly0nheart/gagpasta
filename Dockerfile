FROM python:latest

WORKDIR /app

COPY . .

RUN pip install --upgrade pip && pip install .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "gagpasta:app"]
