import {
    GetLabels,
    GetProjectColumns
} from '../graphql/queries/label-columns-queries';
import { GetProjectColumns as GetProjectColumnsResult } from '../graphql/queries/schema/GetProjectColumns';
import { GetLabels as GetLabelsResult } from '../graphql/queries/schema/GetLabels';
import { createCache } from '../other/ttl-cache';
import { client } from '../graphql/graphql-client';

const cache = createCache();

export async function getProjectBoardColumns() {
    return cache.getAsync('project board column names', Infinity, async () => {
        const res = await query<GetProjectColumnsResult>(GetProjectColumns);
        return res.repository?.project?.columns.nodes ?? [];
    });
}

export async function getLabels() {
    return await cache.getAsync('label ids', Infinity, async () => {
        const res = await query<GetLabelsResult>(GetLabels);
        return res.repository?.labels?.nodes?.filter(defined) ?? [];
    });
}

function defined<T>(arg: T | null | undefined): arg is T {
    return arg != null;
}

async function query<T>(gql: any): Promise<T> {
    const res = await client.query<T>({
        query: gql,
        fetchPolicy: 'network-only'
    });
    return res.data;
}
