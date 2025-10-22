describe('Simple Test', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should test string operations', () => {
    const str = 'Hello World'
    expect(str).toContain('Hello')
    expect(str.length).toBe(11)
  })

  it('should test array operations', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(arr).toHaveLength(5)
    expect(arr).toContain(3)
    expect(arr[0]).toBe(1)
  })

  it('should test object operations', () => {
    const obj = { name: 'Test', value: 42 }
    expect(obj).toHaveProperty('name')
    expect(obj.name).toBe('Test')
    expect(obj.value).toBe(42)
  })
})
