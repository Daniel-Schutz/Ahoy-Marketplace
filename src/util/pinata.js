import axios from 'axios';
const FormData = require('form-data');


export const uploadImagetoIPFS = async (file) => {
    try {
        const url = `${pinataConfig.root}/pinning/pinFileToIPFS`;
        const formData = new FormData();
        formData.append('file', file);
        
        const pinataBody = {
            options: {
                cidVersion: 1,
            },
            metadata: {
                name: file.name,
            }
        };
        
        formData.append('pinataOptions', JSON.stringify(pinataBody.options));
        formData.append('pinataMetadata', JSON.stringify(pinataBody.metadata));
        
        const response = await axios.post(url, formData, {
            headers: {
                ...pinataConfig.headers,
            }
        });
        return {
            success: true,
            pinataURL: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
        };
    }
};
  

export const uploadJSONtoIPFS = async (boatObj) => {
    try {
        const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
        const response = await axios.post(url, boatObj, {
            headers: {
                ...pinataConfig.headers,
            }
        })
        return {
            success: true,
            pinataURL: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
        };
    }
}


export const removeURLfromIPFS = async (pinataURL) => {
    try {
        // Extract the hash from the pinataURL
        // console.log('old url:', pinataURL)
        const hash = pinataURL.split('/').pop();
        const url = `https://api.pinata.cloud/pinning/unpin/${hash}`
        // console.log('delete url:', url)
        const response = await axios.delete(url, {
            headers: {
                ...pinataConfig.headers,
            }
        })
        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
        };
    }
}