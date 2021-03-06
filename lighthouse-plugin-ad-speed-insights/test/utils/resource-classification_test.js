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

const {expect} = require('chai');
const {isGoogleAds, hasAdRequestPath, hasImpressionPath, isGptTag} = require('../../utils/resource-classification');
const {URL} = require('url');

describe('resource-classification', () => {
  describe('#isGoogleAds', () => {
    const testCases = [
      {
        description: 'DoubleClick links without subdomains',
        url: new URL('https://doubleclick.net/gpt/js/pubads.js'),
        expectation: true,
      },
      {
        description: 'Googlesyndication links without subdomains',
        url: new URL('https://googlesyndication.com/gpt/js/pubads.js'),
        expectation: true,
      },
      {
        description: 'DoubleClick lnks with hash and query',
        url: new URL('https://www.doubleclick.net/tag/js/gpt.js?foo=bar#baz'),
        expectation: true,
      },
      {
        description: 'Googlesyndication links with hash and query',
        url: new URL('https://www.googlesyndication.com/tag/js/gpt.js?foo=bar#baz'),
        expectation: true,
      },
      {
        description: 'DoubleClick links with subdomains',
        url: new URL('https://pagead2.doubleclick.net/pcs/activeview'),
        expectation: true,
      },
      {
        description: 'Googlesyndication links with subdomains',
        url: new URL('https://pagead2.googlesyndication.com/pcs/activeview'),
        expectation: true,
      },
      {
        description: 'any other URL',
        url: new URL('https://facebook.com/foo?bar=baz#bat'),
        expectation: false,
      },
    ];
    for (const {description, url, expectation} of testCases) {
      it(`should return ${expectation} for ${description}`, () => {
        const results = isGoogleAds(url);
        expect(results).to.equal(expectation);
      });
    }
  });

  describe('#hasAdRequestPath', () => {
    it('should return true for /gampad/ads in the request path', () => {
      const url = new URL('https://securepubads.g.doubleclick.net/gampad/ads?bar=baz');
      expect(hasAdRequestPath(url)).to.be.true;
    });

    it('should return false for any other ad request path', () => {
      const url = new URL('https://googlesyndication.com/file/folder?bar=baz');
      expect(hasAdRequestPath(url)).to.be.false;
    });
  });

  describe('#hasImpressionPath', () => {
    it('should return true for /pcs/view as the impression path', () => {
      const url = new URL('https://googlesyndication.com/pcs/view?bar=baz');
      expect(hasImpressionPath(url)).to.be.true;
    });

    it('should return true for /pagead/adview as the impression path', () => {
      const url = new URL('https://googlesyndication.com/pagead/adview?bar=baz');
      expect(hasImpressionPath(url)).to.be.true;
    });

    it('should return false for any other impression path', () => {
      const url = new URL('https://googlesyndication.com/file/folder/foo?bar=baz');
      expect(hasImpressionPath(url)).to.be.false;
    });
  });

  describe('#isGptTag', () => {
    const testCases = [
      {
        description: 'URLs that load gpt.js',
        url: new URL('http://www.googletagservices.com/tag/js/gpt.js'),
        expectation: true,
      },
      {
        description: 'URLs that load gpt.js with hash',
        url: new URL('https://www.googletagservices.com/tag/js/gpt.js#foo'),
        expectation: true,
      },
      {
        description: 'URLs that load gpt.js with query string',
        url: new URL('https://www.googletagservices.com/tag/js/gpt.js?foo=bar'),
        expectation: true,
      },
      {
        description: 'URLs that load gpt.js with query string and hash',
        url: new URL('https://www.googletagservices.com/tag/js/gpt.js?foo=bar#baz'),
        expectation: true,
      },
      {
        description: 'URLs that don\'t load gpt.js',
        url: new URL('https://facebook.com/foo?bar=baz'),
        expectation: false,
      },
    ];
    for (const {description, url, expectation} of testCases) {
      it(`should return ${expectation} for ${description}`, () => {
        const results = isGptTag(url);
        expect(results).to.equal(expectation);
      });
    }
  });
});
