# ChainReaction

Wish Program

A simple of example of crearing a PDA.
The PDA for the wish uses the user's key, the wish title and the wish details as seeds. 
This ensures that we dont waste space storing duplicate wishes, however it does make testing more difficult, 
as we need to make this combination unique each time.

In addition i created a data account for the program, although not needed at this stage, this code be useful to 
expand the functionality by storing for example a count of the wishes.
If we need to iterate through the wishes, we could store an index for each wish , and use this as the seed for the PDA.
