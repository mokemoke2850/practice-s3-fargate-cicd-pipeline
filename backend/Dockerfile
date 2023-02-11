FROM golang:1.20-bullseye as deploy-builder

WORKDIR /app

COPY ./go.mod ./go.sum ./
RUN go mod download

COPY ./server.go .
RUN go build -trimpath -ldflags "-w -s" -o app

FROM debian:bullseye-slim as deploy

RUN apt-get update

COPY --from=deploy-builder /app/app .

CMD ["./app"]