export const isDeadWallet = (address: string) => { 
    return [
        '0x000000000000000000000000000000000000dEaD', 
        '0x0000000000000000000000000000000000000000'
    ].includes(address)
}