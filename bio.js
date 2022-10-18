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
  const data = readFileSync(inputFile, { encoding: 'utf8' })
  const config = {
    delimiter: ',',
    quote: '"',
  }

  return toObject(data, config)
}

function writeCSV(inputPath, bioArray) {
  const config = {
    quote: '"',
    delimiter: ',',
    headers: 'key',
  }
  const turnToCSV = toCSV(bioArray, config)
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
  const find = fromCSV.find((csvBio) => csvBio.name.toUpperCase() === newBio.name.toUpperCase())

  if (find === undefined) {
    fromCSV.push(newBio)
    return fromCSV
  }
  return null
}

function readBio(fromCSV, newBio) {
  const find = fromCSV.find((csvBio) => csvBio.name.toUpperCase() === newBio.name.toUpperCase())

  if (find === undefined) {
    return null
  }
  return find
}

function updateBio(fromCSV, newBio) {
  let checkerIfExist = false

  fromCSV.forEach((csvBio) => {
    if (csvBio.name.toUpperCase() === newBio.name.toUpperCase()) {
      Object.assign(csvBio, newBio)
      checkerIfExist = true
    }
  })
  if (checkerIfExist === true) {
    return fromCSV
  }
  return null
}

function deleteBio(fromCSV, newBio) {
  const find = fromCSV.find((csvBio) => csvBio.name.toUpperCase() === newBio.name.toUpperCase())

  if (find === undefined) {
    return null
  }
  const newArr = fromCSV.filter((csvBio) => csvBio.name.toUpperCase() !== newBio.name.toUpperCase())

  return newArr
}

try {
  if (options === undefined && inputName === undefined) {
    throw Error('Option or Name not specified')
  }
  const fromCSV = readCSV('biostats.csv')
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
        const result = createBio(fromCSV, stats)

        if (result === null) {
          throw Error('Name already exists')
        }
        const writeResult = writeCSV('biostats.csv', result)

        if (writeResult === null) {
          throw Error('File does not exist')
        }
      } else if (options.toLowerCase() === '-u') {
        const result = updateBio(fromCSV, stats)

        if (result === null) {
          throw Error('Name does not exist')
        }
        const writeResult = writeCSV('biostats.csv', result)
        if (writeResult === null) {
          throw Error('File does not exist')
        }
      }
      break
    }
    case '-d': case '-r': {
      if (inputName === undefined) {
        throw Error('No name specified')
      }
      const stats = new Bio(inputName.toUpperCase())

      if (options === '-d') {
        const result = deleteBio(fromCSV, stats)

        if (result === null) {
          throw Error('Name does not exist')
        }
        const writeResult = writeCSV('biostats.csv', result)

        if (writeResult === null) {
          throw Error('File does not exist')
        }
      } else if (options === '-r') {
        const result = readBio(fromCSV, stats)

        if (result === null) {
          throw Error('Name does not exist')
        }
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
} catch (error) { console.error('Error: ', error) }
