s = Stack()
s.push(10)
s.push(20)
s.push(0)          # falsy value test

print(s.peek())    # 0
print(s.pop())     # 0
print(s.isEmpty()) # False
s.clear()
print(s.isEmpty()) # True
