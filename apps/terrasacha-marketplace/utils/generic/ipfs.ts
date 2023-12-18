// Functionality to get the IPFS hash from NextJS environment variables
export function getIpfsUrlHash(category: any) {
    if (process.env.NEXT_PUBLIC_ipfs_urlHash) {
        const IPFSUrlHashMap = JSON.parse(Buffer.from(process.env.NEXT_PUBLIC_ipfs_urlHash, 'base64').toString('ascii'))

        if (IPFSUrlHashMap.hasOwnProperty(category)) {
          return IPFSUrlHashMap[category]
        } else {
            return "defaultValueError"
        }
      } else {
        throw new Error(`Parameter ${process.env["tokenNmemonic"]} not found`);
      }
}