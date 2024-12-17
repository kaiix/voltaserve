package router

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/kouprlabs/voltaserve/api/config"
	"github.com/kouprlabs/voltaserve/api/errorpkg"
	"github.com/kouprlabs/voltaserve/api/service"
)

type ChatRouter struct {
	chatSvc               *service.ChatService
	accessTokenCookieName string
}

func NewChatRouter() *ChatRouter {
	return &ChatRouter{
		chatSvc:               service.NewChatService(),
		accessTokenCookieName: "voltaserve_access_token",
	}
}

func (r *ChatRouter) AppendRoutes(router fiber.Router) {
	router.Post("", r.ChatWithFile)
}

type ChatWithFileOptions struct {
	FileID  string `json:"fileId" validate:"required"`
	Message string `json:"message" validate:"required"`
}

func (r *ChatRouter) ChatWithFile(c *fiber.Ctx) error {
	accessToken := c.Cookies(r.accessTokenCookieName)
	if accessToken == "" {
		accessToken = c.Query("access_token")
		if accessToken == "" {
			return errorpkg.NewFileNotFoundError(nil)
		}
	}
	userID, err := r.getUserIDFromAccessToken(accessToken)
	if err != nil {
		return c.SendStatus(http.StatusNotFound)
	}

	opts := new(ChatWithFileOptions)
	if err := c.BodyParser(opts); err != nil {
		return err
	}

	message, err := r.chatSvc.Chat(opts.FileID, userID, opts.Message)
	if err != nil {
		return err
	}

	return c.JSON(message)
}

func (r *ChatRouter) getUserIDFromAccessToken(accessToken string) (string, error) {
	token, err := jwt.Parse(accessToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(config.GetConfig().Security.JWTSigningKey), nil
	})
	if err != nil {
		return "", err
	}
	if !token.Valid {
		return "", errors.New("invalid token")
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		return claims["sub"].(string), nil
	} else {
		return "", errors.New("cannot find sub claim")
	}
}
