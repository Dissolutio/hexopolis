// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  // eslint-disable-next-line no-restricted-globals
  self.onmessage = ({ data: numberToFibo }) => {
    // eslint-disable-next-line no-restricted-globals
    var n1 = self.BigInt(0)
    // eslint-disable-next-line no-restricted-globals
    var n2 = self.BigInt(1)
    // eslint-disable-next-line no-restricted-globals
    var somme = self.BigInt(0)

    for (let i = 2; i <= numberToFibo; i++) {
      somme = n1 + n2

      n1 = n2

      n2 = somme
    }

    const result = numberToFibo ? n2 : n1

    postMessage(result)
  }
}
