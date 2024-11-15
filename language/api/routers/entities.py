# Copyright 2023 Anass Bouassaba.
#
# Use of this software is governed by the Business Source License
# included in the file licenses/BSL.txt.
#
# As of the Change Date specified in that file, in accordance with
# the Business Source License, use of this software will be governed
# by the GNU Affero General Public License v3.0 only, included in the file
# licenses/AGPL.txt.

from flask import Blueprint, request, jsonify
from ..services.models import nlp
from ..services.entities import EntityExtractor

bp = Blueprint("entities", __name__)


@bp.route("/v3/entities", methods=["POST"])
def get_entities():
    content = request.json
    entity_extractor = EntityExtractor(nlp[content["language"]])
    dtos = entity_extractor.run(content["text"])

    return jsonify(dtos)
