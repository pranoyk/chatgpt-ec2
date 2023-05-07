	// Load the AWS SDK for Node.js
import AWS from 'aws-sdk';
	// Load credentials and set region from JSON file

export async function createInstance(region, instanceParams) {
	console.log(region, instanceParams)
	AWS.config.update({region});
	let params = JSON.parse(instanceParams)

	// Create a promise on an EC2 service object
	var instancePromise = new AWS.EC2({apiVersion: '2016-11-15'}).runInstances(params).promise();

	// Handle promise's fulfilled/rejected states
	return instancePromise
}

// export function extract() {
// 	let str = `{
// 		ImageId: 'ami-0a79730daaf45078a', 
// 		InstanceType: 't2.micro',
// 		MinCount: 1,
// 		MaxCount: 1
// 	}
// 	Region: us-east-1`
// 	let open = str.indexOf('{')
// 	let close = str.lastIndexOf('}')
// 	let json = str.substring(open, close+1)
// 	console.log(json)
// 	let region = str.match(/Region:.*/g)[0].split(': ')

// 	console.log(region[1])
// }

// extract()
// createInstance("eu-north-1", `{
// 	"ImageId": "ami-02858011c7df8d87e", 
// 	"InstanceType": "t3.micro",
// 	"MinCount": 1,
// 	"MaxCount": 1
//   }
//   `)