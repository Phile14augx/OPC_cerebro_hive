package config

import "os"

type Config struct {
	HTTPPort    string
	DatabaseURL string
	JWTSecret   string
	Environment string
}

func Load() *Config {
	port := os.Getenv("HTTP_PORT")
	if port == "" {
		port = "3000"
	}

	return &Config{
		HTTPPort:    port,
		DatabaseURL: os.Getenv("DATABASE_URL"),
		JWTSecret:   os.Getenv("JWT_SECRET"),
		Environment: os.Getenv("ENVIRONMENT"),
	}
}
