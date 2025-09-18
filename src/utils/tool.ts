interface Place {
  where: string
  name: string
  age?: number | string
}

interface Person {
  name: string
  age: number
  from: Place
}

interface House {
  address: string
  price: number
  tenants: Person[]
}

function newPerson(name: string, age: number, from: Place): Person {
  return {
    name,
    age,
    from,
  }
}

const newHouse: House = {
  address: '123 Main St',
  price: 5000,
  tenants: [
    newPerson('Alice', 30, { where: 'CityA', name: 'PlaceA' }),
    newPerson('Bob', 25, { where: 'CityB', name: 'PlaceB', age: 5 }),
  ],
}

function getIntoHouse(house: House, person: Person): void {
  house.tenants.push(person)
}

export { newPerson, newHouse, getIntoHouse }
