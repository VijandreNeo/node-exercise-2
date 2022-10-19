const { toObject, toCSV } = require('csvjson')
const { readFileSync, existsSync, writeFile } = require('fs')

const [,, options, inputName, inputSex, inputAge, inputHeight, inputWeight] = process.argv

class Bio {
  constructor(name, sex, age, height, weight) {
    this.name = name
    this.sex = sex
    this.age = age
    this.height = height
    this.weight = weight
  }
}

function readCSV(inputFile) {
  if (!existsSync(inputFile)) {
    return null
  }
  const data = readFileSync(inputFile, { encoding: 'utf8' })
  const config = {
    delimiter: ',',
    quote: '"',
  }
  const extractedArr = toObject(data, config)
  const dataToMap = new Map()

  extractedArr.forEach((extractedObj) => {
    dataToMap.set(extractedObj.name, extractedObj)
  })
  return dataToMap
}

function writeCSV(inputPath, bioMap) {
  const config = {
    quote: '"',
    delimiter: ',',
    headers: 'key',
  }
  const turnToCSV = toCSV(Array.from(bioMap.values()), config)
  if (!existsSync(inputPath)) {
    return null
  }
  writeFile(inputPath, turnToCSV, (appendError) => {
    if (appendError) {
      throw appendError
    }
  })
  return true
}

function createBio(fromCSV, newBio) {
  if (fromCSV.has(newBio.name)) {
    throw new Error('Name already exists')
  }
  fromCSV.set(newBio.name, newBio)
  return new Map(fromCSV)
}

function readBio(fromCSV, newBio) {
  if (!fromCSV.has(newBio.name)) {
    throw new Error('Name does not exist')
  }
  return fromCSV.get(newBio.name)
}

function updateBio(fromCSV, newBio) {
  if (!fromCSV.has(newBio.name)) {
    throw new Error('Name does not exist')
  }
  const alteredMap = new Map(fromCSV)
  alteredMap.set(newBio.name, newBio)
  return alteredMap
}

function deleteBio(fromCSV, newBio) {
  if (!fromCSV.has(newBio.name)) {
    throw new Error('Name does not exist')
  }
  const alteredMap = new Map(fromCSV)
  alteredMap.delete(newBio.name)
  return alteredMap
}

try {
  if (options === undefined && inputName === undefined) {
    throw Error('Option or Name not specified')
  }
  const fromCSV = readCSV('biostats.csv')
  if (fromCSV === null) {
    throw Error('File does not exist')
  }
  switch (options.toLowerCase()) {
    case '-c': case '-u': {
      const sexUpperCase = inputSex.toUpperCase()
      const ageInt = parseInt(inputAge, 10)
      const heightInt = parseInt(inputHeight, 10)
      const weightInt = parseInt(inputWeight, 10)

      if (sexUpperCase !== 'F' && sexUpperCase !== 'M') {
        throw Error('Incorrect Sex')
      } else if (Number.isNaN(ageInt) || ageInt < 18) {
        throw Error('Age not a number or underaged')
      } else if (Number.isNaN(heightInt)) {
        throw Error('Height not a number')
      } else if (Number.isNaN(weightInt)) {
        throw Error('Weight not a number')
      }
      const nameUpperCase = inputName[0].toUpperCase() + inputName.substring(1).toLowerCase()
      const stats = new Bio(nameUpperCase, sexUpperCase, ageInt, heightInt, weightInt)

      if (options.toLowerCase() === '-c') {
        writeCSV('biostats.csv', createBio(fromCSV, stats))
      } else if (options.toLowerCase() === '-u') {
        writeCSV('biostats.csv', updateBio(fromCSV, stats))
      }
      break
    }
    case '-d': case '-r': {
      if (inputName === undefined) {
        throw Error('No name specified')
      }
      const stats = new Bio(inputName[0].toUpperCase() + inputName.substring(1).toLowerCase())

      if (options === '-d') {
        writeCSV('biostats.csv', deleteBio(fromCSV, stats))
      } else if (options === '-r') {
        const result = readBio(fromCSV, stats)

        console.log(`
          Name: ${result.name}
          Sex: ${result.sex === 'F' ? 'FEMALE' : 'MALE'}
          Age: ${result.age}
          Height (inches): ${result.height} (centimeters): ${result.height *= 2.54} 
          Weight (pounds): ${result.weight} (kilos): ${result.weight *= 0.45359237}
          `)
      }
      break
    }
    default:
      throw Error('Wrong option argument')
  }
} catch (error) { console.log(error.toString()) }
