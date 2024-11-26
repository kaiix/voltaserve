// Copyright (c) 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file LICENSE in the root of this repository.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// AGPL-3.0-only in the root of this repository.
import { useMemo } from 'react'
import { variables } from '@koupr/ui'
import { File } from '@/client/api/file'
import { getAccessTokenOrRedirect } from '@/infra/token'

export type ViewerVideoProps = {
  file: File
}

const ViewerVideo = ({ file }: ViewerVideoProps) => {
  const download = useMemo(() => file.snapshot?.original, [file])
  const url = useMemo(() => {
    if (!download || !download.extension) {
      return ''
    }
    return `/proxy/api/v3/files/${file.id}/preview${
      download.extension
    }?${new URLSearchParams({
      access_token: getAccessTokenOrRedirect(),
    })}`
  }, [file, download])

  if (!download) {
    return null
  }

  return (
    <video
      controls
      autoPlay
      style={{
        maxWidth: '90%',
        maxHeight: '90%',
        borderRadius: variables.borderRadius,
      }}
    >
      <source src={url} />
    </video>
  )
}

export default ViewerVideo
