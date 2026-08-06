import { NextResponse } from "next/server";

const TOKEN_URL =
  "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";

const STATS_URL =
  "https://sh.dataspace.copernicus.eu/statistics/v1";

export async function GET() {
  const clientId = process.env.SENTINEL_CLIENT_ID!;
  const clientSecret = process.env.SENTINEL_CLIENT_SECRET!;

  const tokenResponse = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenResponse.ok) {
    return NextResponse.json(
      { error: "OAuth selhal" },
      { status: 500 }
    );
  }

  const token = await tokenResponse.json();

  const accessToken = token.access_token;

  const longitude = 14.4378;
  const latitude = 50.0755;

  const response = await fetch(STATS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      input: {
        bounds: {
          bbox: [
            longitude - 0.001,
            latitude - 0.001,
            longitude + 0.001,
            latitude + 0.001,
          ],
        },
        data: [
          {
            type: "sentinel-2-l2a",
          },
        ],
      },
      aggregation: {
        timeRange: {
          from: "2025-06-01T00:00:00Z",
          to: "2025-08-01T23:59:59Z",
        },
        aggregationInterval: {
          of: "P1D",
        },
        width: 64,
        height: 64,evalscript: `
//VERSION=3

function setup() {
  return {
    input: [{
      bands: ["B04", "B08", "dataMask"]
    }],
    output: [
      {
        id: "data",
        bands: 1
      },
      {
        id: "dataMask",
        bands: 1
      }
    ]
  };
}

function evaluatePixel(samples) {
  const ndvi =
    (samples.B08 - samples.B04) /
    (samples.B08 + samples.B04);

  return {
    data: [ndvi],
    dataMask: [samples.dataMask]
  };
}
`,
      },

      calculations: {
        default: {
          statistics: {
            default: {
              percentiles: {
                k: [5, 50, 95],
              },
            },
          },
        },
      },

      evalscript: `
//VERSION=3

function setup() {
  return {
    input: ["B04", "B08", "dataMask"],
    output: [
      {
        id: "default",
        bands: 1
      },
      {
        id: "dataMask",
        bands: 1
      }
    ]
  };
}

function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);

  return {
    default: [ndvi],
    dataMask: [sample.dataMask]
  };
}
`,
    }),
  });
   const json = await response.json();

  return NextResponse.json(json);
}