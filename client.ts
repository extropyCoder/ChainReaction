use anchor_lang::prelude::*;

declare_id!("5LcXJbkBZ15eD66RnnZn6AqCcHxgz72smqZ3imnF8UnE");

#[program]
pub mod wishwall {
    use super::*;
    // Initialise, we also add a program data account here, it is not needed yet
    // but could be useful 
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    msg!("Inside initialize");
    let data = &mut ctx.accounts.program_data;
    let owner_account = &ctx.accounts.authority;
    msg!("Got accounts");

    let now = Clock::get()?.unix_timestamp;
    data.create_timestamp = now;
    data.owner = owner_account.key();
    msg!("Program initialized at {}", now);
    Ok(())


    }
    
    // Create a new wish and store it in a PDA account.
    // TO avoid duplication each combination of wish title and details is used 
    // in the seed to derive the PDA
    pub fn create_wish(ctx: Context<CreateWish>, title: String, details: String) -> Result<()> {
        let wish_account = &mut ctx.accounts.wish;
        let author = &ctx.accounts.user;
        
        // Add the wish details
        wish_account.title = title;
        wish_account.author = author.key();
        wish_account.details = details;
        wish_account.timestamp = Clock::get()?.unix_timestamp;
        
        msg!("New Wish added: {}", wish_account.title);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {

    #[account(init, payer = authority, space = 8 + 32 + 8 )] // Discriminator + pubkey + timestamp
    pub program_data: Account<'info, ProgramData>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String, details : String)]

pub struct CreateWish<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    // Create a PDA for the wish
    // The seeds used are: 
    // - user's public key
    // - title of the wish
    // - detsils of the wish
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 4 + title.len() + details.len() + 4 + 256 + 8, // Discriminator + pubkey + title + details + timestamp
        seeds = [b"wish", user.key().as_ref(), title.as_bytes(), details.as_bytes()],
        bump
    )]
    pub wish: Account<'info, AWish>,
    pub system_program: Program<'info, System>,
}


#[account]
pub struct ProgramData {    
    pub owner: Pubkey,
    pub create_timestamp: i64,
}

#[account]
pub struct AWish {
    pub author: Pubkey,
    pub title: String,
    pub details: String,
    pub timestamp: i64,
}



