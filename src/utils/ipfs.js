import { create } from 'ipfs-http-client';

const auth = `Basic ${Buffer.from(
  `${process.env.REACT_APP_IPFS_API_KEY}:${process.env.REACT_APP_IPFS_API_SECRET}`
).toString('base64')}`;

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth
  }
});

export const uploadToIPFS = async (file) => {
  try {
    const added = await ipfs.add(file);
    return added.path;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

export const getFromIPFS = async (hash) => {
  try {
    const url = `https://ipfs.io/ipfs/${hash}`;
    const response = await fetch(url);
    return response;
  } catch (error) {
    console.error('Error getting from IPFS:', error);
    throw error;
  }
}; 