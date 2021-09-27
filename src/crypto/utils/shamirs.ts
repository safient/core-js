const shamirs = require('shamirs-secret-sharing')
//Generate Shares


export const _shamirSplit = function (data: Object, noOfShares: number, threshold: number): Buffer[] {
        let shares: Buffer[] = shamirs.split(JSON.stringify(data), {shares: noOfShares, threshold: threshold});
        return shares;
};

export const _shamirCombine = function (shards: any): any {
      let reconstructedData = shamirs.combine([Buffer.from(shards[0]), Buffer.from(shards[1])])
      return reconstructedData;
};

