import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { MultisigLite } from "../target/types/multisig_lite";

describe("multisig-lite", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.MultisigLite as Program<MultisigLite>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
