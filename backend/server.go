package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	CORS_PERMIT := os.Getenv("FRONTEND_URL")
	if CORS_PERMIT == "" {
		CORS_PERMIT = "http://localhost:5173"
	}

	API_ENV := os.Getenv("API_ENV")
	if API_ENV == "" {
		API_ENV = "local"
	}

	API_PORT := os.Getenv("API_PORT")
	if API_PORT == "" {
		API_PORT = "8000"
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

	e.GET("/title", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello From API")
	})

	e.GET("/simulation", func(c echo.Context) error {
		SIMULATION_URL := os.Getenv("SIMULATION_URL")
		if SIMULATION_URL == "" {
			SIMULATION_URL = "localhost:50051"
		}

		req_url, _ := url.JoinPath(SIMULATION_URL, "simulation")

		resp, err := http.Get(req_url)
		if err != nil {
			return c.String(http.StatusInternalServerError, "error occured! in simulation")
		}
		defer resp.Body.Close()

		byteArray, _ := ioutil.ReadAll(resp.Body)
		return c.String(http.StatusOK, string(byteArray))
	})

}
