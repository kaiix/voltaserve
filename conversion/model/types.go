// Copyright 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// licenses/AGPL.txt.

package model

import (
	"github.com/kouprlabs/voltaserve/conversion/client/api_client"
)

type Pipeline interface {
	Run(api_client.PipelineRunOptions) error
	RunFromLocalPath(string, api_client.PipelineRunOptions) error
}

type Builder interface {
	Build(api_client.PipelineRunOptions) error
}
