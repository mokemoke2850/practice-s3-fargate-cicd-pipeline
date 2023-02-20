package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	CORS_PERMIT := os.Getenv("BACKEND_URL")
	if CORS_PERMIT == "" {
		CORS_PERMIT = "localhost:8000"
	}

	API_ENV := os.Getenv("API_ENV")
	if API_ENV == "" {
		API_ENV = "local"
	}

	API_PORT := os.Getenv("API_PORT")
	if API_PORT == "" {
		API_PORT = "50051"
	}

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{CORS_PERMIT},
		AllowMethods: []string{"*"},
	}))

	registRoute(e)

	fmt.Printf("launch &s mode\n", API_ENV)
	e.Logger.Fatal(e.Start(":" + API_PORT))
}

func registRoute(e *echo.Echo) {

	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "HelloWorld!")
	})

	e.GET("/ishealthy", func(c echo.Context) error {
		return c.String(http.StatusOK, "ishealty")
	})

	e.GET("/simulation", func(c echo.Context) error {
		return c.String(http.StatusOK, "HelloWorld! From Simulation. Updated 2nd")
	})

}
