// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const NetworkRecords = require('lighthouse/lighthouse-core/computed/network-records');
const {auditNotApplicable} = require('../utils/builder');
const {Audit} = require('lighthouse');
const {getPageStartTime, getTagEndTime} = require('../utils/network-timing');

// Point of diminishing returns.
const PODR = 500;
const MEDIAN = 1000;
/**
 * Audit to determine time for tag to load relative to page start.
 */
class TagLoadTime extends Audit {
  /**
   * @return {LH.Audit.Meta}
   * @override
   */
  static get meta() {
    return {
      id: 'tag-load-time',
      title: 'Tag load time',
      failureTitle: 'Reduce tag load time',
      description: 'This measures the time for the Google Publisher' +
          ' Tag\'s implementation script (pubads_impl.js) to load after the ' +
          'page loads. [Learn more.]' +
          '(https://ad-speed-insights.appspot.com/#measurements)',
      // @ts-ignore
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      requiredArtifacts: ['devtoolsLogs'],
    };
  }
  /**
   * @param {LH.Artifacts} artifacts
   * @param {LH.Audit.Context} context
   * @return {Promise<LH.Audit.Product>}
   */
  static async audit(artifacts, context) {
    const devtoolsLogs = artifacts.devtoolsLogs[Audit.DEFAULT_PASS];
    const networkRecords = await NetworkRecords.request(devtoolsLogs, context);
    const pageStartTime = getPageStartTime(networkRecords);
    const tagEndTime = getTagEndTime(networkRecords);
    if (pageStartTime < 0) {
      return auditNotApplicable('No successful network records');
    }
    if (tagEndTime < 0) {
      return auditNotApplicable('No tag loaded');
    }
    const tagLoadTime = (tagEndTime - pageStartTime) * 1000;

    let normalScore = Audit.computeLogNormalScore(tagLoadTime, PODR, MEDIAN);

    // Results that have green text should be under passing category.
    if (normalScore >= .9) {
      normalScore = 1;
    }

    return {
      rawValue: tagLoadTime,
      score: normalScore,
      displayValue: Math.round(tagLoadTime).toLocaleString() + ' ms',
    };
  }
}
module.exports = TagLoadTime;
