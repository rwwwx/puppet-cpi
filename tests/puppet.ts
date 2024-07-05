import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import {assert, expect} from 'chai'
import { Puppet } from '../target/types/puppet'
import { PuppetMaster } from '../target/types/puppet_master'
const { SystemProgram } = anchor.web3;

describe('puppet', () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)


  const puppetProgram = anchor.workspace.Puppet as Program<Puppet>
  const puppetMasterProgram = anchor.workspace
      .PuppetMaster as Program<PuppetMaster>;

  let puppetAccount = anchor.web3.Keypair.generate();
  let [puppetMasterPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("my_seed")],
      puppetMasterProgram.programId
  );


  const puppetKeypair = Keypair.generate()


  it('Initializes the puppet master', async () => {
      await puppetMasterProgram.methods
        .init(bump)
        .accounts({
          puppetMaster: puppetMasterPda,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const puppetMaster = await puppetMasterProgram.account.puppetMaster.fetch(puppetMasterPda);
      console.log('Puppet Master initialized with bump:', puppetMaster.bump);
      assert.equal(puppetMaster.bump, bump)
      });

    it('Init puppet data', async () => {
        // Initialize the puppet account
        await puppetProgram
            .methods
            .initialize()
            .accounts({
                puppet: puppetKeypair.publicKey,
                user: provider.wallet.publicKey,
            })
            .signers([puppetKeypair])
            .rpc();
    });

    it('Set puppet data', async () => {
        // Set puppet data through the puppet master program
        await puppetMasterProgram
            .methods
            .pullStrings(new anchor.BN(42))
            .accounts({
                puppet: puppetKeypair.publicKey,
                puppetProgram: puppetProgram.programId,
                puppetMasterForBump: puppetMasterPda,
            })
            .rpc();

        const puppet = await puppetProgram.account.data.fetch(puppetKeypair.publicKey);
        console.log('Puppet data set to:', puppet.data.toNumber());
        assert.equal(puppet.data.toNumber(), 42);
    })
})