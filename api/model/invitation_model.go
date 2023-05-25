package model

const (
	InvitationStatusPending  = "pending"
	InvitationStatusAccepted = "accepted"
	InvitationStatusDeclined = "declined"
)

type CoreInvitation interface {
	GetID() string
	GetOrganizationID() string
	GetOwnerID() string
	GetEmail() string
	GetStatus() string
	GetCreateTime() string
	GetUpdateTime() *string
	SetStatus(string)
	SetUpdateTime(*string)
}
