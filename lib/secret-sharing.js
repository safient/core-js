const shamirs = require("shamirs-secret-sharing");

export const secretSplit = async (data) => {
    const secretShare = Buffer.from(data);
    const shares = shamirs.split(secretShare, {shares: 3, threshold: 2});
    return shares
}

export const reconstructShares = async(shards) => {
    console.log(shards)
    const shares = Buffer.from(shards)
    console.log(shares)
    const reconstruct = shamirs.combine(shards[0], shards[1]);
    console.log(reconstruct)
    // return reconstruct
}