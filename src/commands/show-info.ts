import { queryPRInfo, deriveStateForPR } from "../other/pr-info";
import * as computeActions from "../actions/compute-pr-actions";
import { render } from "prettyjson";
import { executePrActions } from "../actions/execute-pr-actions";
import { formatMutationRequest } from "../utils/formatMutationRequest";

async function main() {
  const num = +process.argv[2];
  const info = await queryPRInfo(num);
  const state = await deriveStateForPR(info);
  console.log(``);
  console.log(`=== Raw PR Info ===`);
  console.log(render(state));

  if (state.type !== "info") {
    return;
  }

  const actions = computeActions.process(state);
  console.log(``);
  console.log(`=== Actions ===`);
  console.log(render(actions));

  const mutations = await executePrActions(actions, info.data, /*dry*/ true);
  console.log(``);
  console.log(`=== Mutations ===`);
  console.log(render(mutations.map(formatMutationRequest)));
}

main().then(() => {
  console.log("Done!");
  process.exit(0);
}, err => {
  if (err?.stack) {
      console.error(err.stack);
  } else {
      console.error(err);
  }
  process.exit(1);
});
