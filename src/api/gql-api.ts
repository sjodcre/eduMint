// // src/app/api/gqlApi.ts
// import { GATEWAYS, CURSORS, PAGINATORS } from "@/shared/config/config";
// import { QueryBodyGQLArgsType } from "@/shared/types/gql";
// export function getQuery(body: string): string {
//   const query = { query: `query { ${body} }` };
//   return JSON.stringify(query);
// }

import { CURSORS, GATEWAYS, PAGINATORS } from "@/shared/config/config";
import { QueryBodyGQLArgsType } from "@/shared/types/gql";

// export function getQueryBody(args: QueryBodyGQLArgsType): string {
//   const paginator = args.paginator ?? PAGINATORS.default;
//   const ids = args.ids ? JSON.stringify(args.ids) : null;
//   const blockFilter = args.minBlock || args.maxBlock
//     ? JSON.stringify({ min: args.minBlock, max: args.maxBlock }).replace(/"([^"]+)":/g, "$1:")
//     : null;
//   const tagFilters = args.tagFilters
//     ? JSON.stringify(args.tagFilters).replace(/"name":|"values":/g, (match) => match.slice(1, -2))
//     : null;
//   const owners = args.owners ? JSON.stringify(args.owners) : null;
//   const cursor = args.cursor !== CURSORS.end ? `"${args.cursor}"` : null;

//   return `
//     transactions(
//       ids: ${ids},
//       tags: ${tagFilters},
//       first: ${paginator},
//       owners: ${owners},
//       block: ${blockFilter},
//       after: ${cursor}
//     ) {
//       count
//       pageInfo { hasNextPage }
//       edges {
//         cursor
//         node {
//           id
//           tags { name value }
//           data { size type }
//           owner { address }
//           block { height timestamp }
//         }
//       }
//     }
//   `;
// }

// export async function gqlRequest(args: { gateway: string; query: string }): Promise<any> {
//   const url = `https://${args.gateway}/graphql`;
//   const options = {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: args.query,
//   };
//   const response = await fetch(url, options);
//   return response.json();
// }




export function getQuery(body: string): string {
	const query = { query: `query { ${body} }` };
	return JSON.stringify(query);
}

export function getQueryBody(args: QueryBodyGQLArgsType): string {
	const paginator = args.paginator ? args.paginator : PAGINATORS.default;
	const ids = args.ids ? JSON.stringify(args.ids) : null;
	let blockFilter: { min?: number; max?: number } | null = null;
	if (args.minBlock !== undefined && args.minBlock !== null) {
		blockFilter = {};
		blockFilter.min = args.minBlock;
	}
	const blockFilterStr = blockFilter ? JSON.stringify(blockFilter).replace(/"([^"]+)":/g, '$1:') : null;
	const tagFilters = args.tagFilters
		? JSON.stringify(args.tagFilters)
				.replace(/"(name)":/g, '$1:')
				.replace(/"(values)":/g, '$1:')
				.replace(/"FUZZY_OR"/g, 'FUZZY_OR')
		: null;
	const owners = args.owners ? JSON.stringify(args.owners) : null;
	const cursor = args.cursor && args.cursor !== CURSORS.end ? `"${args.cursor}"` : null;

	let fetchCount: string = `first: ${paginator}`;
	let txCount: string = '';
	let nodeFields: string = `data { size type } owner { address } block { height timestamp }`;
	let order: string = '';

	switch (args.gateway) {
		case GATEWAYS.arweave:
			break;
		case GATEWAYS.goldsky:
			txCount = `count`;
			break;
	}

	let body = `
		transactions(
				ids: ${ids},
				tags: ${tagFilters},
				${fetchCount}
				owners: ${owners},
				block: ${blockFilterStr},
				after: ${cursor},
				${order}
				
			){
			${txCount}
				pageInfo {
					hasNextPage
				}
				edges {
					cursor
					node {
						id
						tags {
							name 
							value 
						}
						${nodeFields}
					}
				}
		}`;

	if (args.queryKey) body = `${args.queryKey}: ${body}`;

	return body;
}

export async function getResponse(args: { gateway: string; query: string }): Promise<any> {
	try {
		const response = await fetch(`https://${args.gateway}/graphql`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: args.query,
		});
		return await response.json();
	} catch (e: any) {
		throw e;
	}
}