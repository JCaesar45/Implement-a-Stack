public class Main {
    public static void main(String[] args) {
        Stack s = new Stack();
        s.push(10);
        s.push(20);
        s.push(0);           // falsy value

        System.out.println(s.peek());   // 0
        System.out.println(s.pop());    // 0
        System.out.println(s.isEmpty());// false
        s.clear();
        System.out.println(s.isEmpty());// true
    }
}
