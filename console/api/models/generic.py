# Copyright 2024 Piotr Łoboda.
#
# Use of this software is governed by the Business Source License
# included in the file licenses/BSL.txt.
#
# As of the Change Date specified in that file, in accordance with
# the Business Source License, use of this software will be governed
# by the GNU Affero General Public License v3.0 only, included in the file
# licenses/AGPL.txt.

import datetime
from typing import List, Any

from fastapi import status
from pydantic import BaseModel, Field


# --- REQUEST MODELS --- #
class GenericRequest(BaseModel):
    id: str = Field(...)

    # @model_validator(mode='after')
    # def not_null(self) -> Self:
    #     if not any(self.model_dump(exclude={'id'}).values()):
    #         raise ValueError('At lease one value must be set!')
    #
    #     return self


class GenericPaginationRequest(BaseModel):
    page: int | None = Field(default=1)
    size: int | None = Field(default=10)


class GenericSearchRequest(GenericPaginationRequest):
    query: str | None = Field("")


# --- RESPONSE MODELS --- #
class GenericResponse(BaseModel):
    id: str


class CountResponse(BaseModel):
    count: int | str


class GenericListResponse(BaseModel):
    totalElements: int
    totalPages: int | None = Field(None)
    page: int
    size: int
    data: List[Any]


class GenericErrorResponse(BaseModel):
    code: str
    status: int
    message: str
    userMessage: str
    moreInfo: str


class GenericNotFoundResponse(BaseModel):
    status_code: int = status.HTTP_404_NOT_FOUND
    detail: str = "Not found"


class GenericUnauthorizedResponse(BaseModel):
    status_code: int = status.HTTP_401_UNAUTHORIZED
    detail: str = "Unauthorized"


class GenericServiceUnavailableResponse(BaseModel):
    status_code: int = status.HTTP_401_UNAUTHORIZED
    detail: str = "Unauthorized"


class GenericUnexpectedErrorResponse(BaseModel):
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    detail: str = "Unexpected error"


class GenericAcceptedResponse(BaseModel):
    pass


# --- TOKEN SPECIFIC --- #
class GenericTokenPayload(BaseModel):
    sub: str
    iat: datetime.datetime
    iss: str
    aud: str
    exp: datetime.datetime


class GenericTokenRequest(BaseModel):
    pass


class GenericTokenResponse(BaseModel):
    pass
