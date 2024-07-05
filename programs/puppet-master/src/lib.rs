use anchor_lang::prelude::*;
use puppet::cpi::accounts::SetData;
use puppet::program::Puppet;
use puppet::{self, Data};

declare_id!("FVHuYGej5r7mcRGtx3iWNNeTKPnvxhM1BJKVJuRZdeSk");

#[program]
mod puppet_master {
    use super::*;

    pub fn init(ctx: Context<Initialize>, bump: u8) -> Result<()> {
        ctx.accounts.puppet_master.bump = bump;
        Ok(())
    }

    pub fn pull_strings(ctx: Context<PullStrings>, data: u64) -> Result<()> {
        puppet::cpi::set_data(ctx.accounts.set_data_ctx(), data)
    }
}

impl<'info> PullStrings<'info> {
    pub fn set_data_ctx(&self) -> CpiContext<'_, '_, '_, 'info, SetData<'info>> {
        let cpi_program = self.puppet_program.to_account_info();
        let cpi_accounts = SetData {
            puppet: self.puppet.to_account_info()
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

#[derive(Accounts)]
pub struct PullStrings<'info> {
    #[account(mut)]
    pub puppet: Account<'info, Data>,
    pub puppet_program: Program<'info, Puppet>,
    #[account(seeds = [b"my_seed".as_ref()], bump = puppet_master_for_bump.bump)]
    pub puppet_master_for_bump: Account<'info, PuppetMaster>
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8 + 1, seeds = [b"my_seed".as_ref()], bump)]
    pub puppet_master: Account<'info, PuppetMaster>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct PuppetMaster {
    pub bump: u8,
}