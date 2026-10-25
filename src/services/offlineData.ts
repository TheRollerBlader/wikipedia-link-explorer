export interface OfflineArticle {
  title: string;
  category: string;
  description: string;
  summary: string;
  thumbnail: string;
  links: string[];
}

export const OFFLINE_KNOWLEDGE_BASE: Record<string, OfflineArticle> = {
  "Alan Turing": {
    title: "Alan Turing",
    category: "Computer Science",
    description: "English mathematician, computer scientist and cryptanalyst",
    summary: "Alan Mathison Turing was an English mathematician, computer scientist, logician, cryptanalyst, philosopher and theoretical biologist. Turing was highly influential in the development of theoretical computer science, providing a formalisation of the concepts of algorithm and computation with the Turing machine.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Alan_Turing_Aged_16.jpg/320px-Alan_Turing_Aged_16.jpg",
    links: [
      "Turing machine",
      "Artificial intelligence",
      "Computer science",
      "Cryptanalysis of the Enigma",
      "Turing test",
      "Morphogenesis",
      "Algorithm",
      "Mathematics",
      "Church–Turing thesis",
      "Computability theory"
    ]
  },
  "Turing machine": {
    title: "Turing machine",
    category: "Theoretical CS",
    description: "Mathematical model of computation",
    summary: "A Turing machine is a mathematical model of computation describing an abstract machine that manipulates symbols on a strip of tape according to a table of rules. Despite the model's simplicity, it is capable of implementing any computer algorithm.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Turing_machine_hardware.jpg/320px-Turing_machine_hardware.jpg",
    links: [
      "Alan Turing",
      "Computer science",
      "Algorithm",
      "Church–Turing thesis",
      "Halting problem",
      "Automata theory",
      "Decidability (logic)",
      "Computational complexity theory"
    ]
  },
  "Artificial intelligence": {
    title: "Artificial intelligence",
    category: "Computer Science",
    description: "Intelligence demonstrated by machines",
    summary: "Artificial intelligence (AI) is the intelligence of machines or software, as opposed to the intelligence of living beings, primarily of humans. It is an academic field of study that focuses on developing technologies capable of tasks normally requiring human intelligence.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Computer_vision_symbol_1.png/320px-Computer_vision_symbol_1.png",
    links: [
      "Machine learning",
      "Deep learning",
      "Alan Turing",
      "Turing test",
      "Neural network (machine learning)",
      "Computer vision",
      "Natural language processing",
      "Robotics",
      "Philosophy of mind",
      "Cognitive science"
    ]
  },
  "Machine learning": {
    title: "Machine learning",
    category: "Computer Science",
    description: "Study of algorithms that improve through experience",
    summary: "Machine learning (ML) is an umbrella term for solving problems for which the development of algorithms by human programmers would be cost-prohibitive. Instead, the problems are solved by helping machines discover their own algorithms without explicit instructions.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Supervised_machine_learning_in_a_nutshell.svg/320px-Supervised_machine_learning_in_a_nutshell.svg.png",
    links: [
      "Artificial intelligence",
      "Deep learning",
      "Neural network (machine learning)",
      "Supervised learning",
      "Unsupervised learning",
      "Reinforcement learning",
      "Statistics",
      "Pattern recognition"
    ]
  },
  "Deep learning": {
    title: "Deep learning",
    category: "Computer Science",
    description: "Machine learning methods based on artificial neural networks",
    summary: "Deep learning is part of a broader family of machine learning methods based on artificial neural networks with representation learning. Learning can be supervised, semi-supervised or unsupervised.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Artificial_neural_network.svg/320px-Artificial_neural_network.svg.png",
    links: [
      "Machine learning",
      "Neural network (machine learning)",
      "Convolutional neural network",
      "Transformer (deep learning architecture)",
      "Backpropagation",
      "Artificial intelligence",
      "Computer vision"
    ]
  },
  "Computer science": {
    title: "Computer science",
    category: "Computer Science",
    description: "Study of computation, information, and automation",
    summary: "Computer science is the study of computation, information, and automation. Computer science spans theoretical disciplines such as algorithms, theory of computation, information theory and automation to practical disciplines including computer hardware and software design.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Babbage_Difference_Engine.jpg/320px-Babbage_Difference_Engine.jpg",
    links: [
      "Alan Turing",
      "Algorithm",
      "Data structure",
      "Software engineering",
      "Graph theory",
      "Internet",
      "Operating system",
      "Artificial intelligence",
      "Programming language"
    ]
  },
  "Graph theory": {
    title: "Graph theory",
    category: "Mathematics",
    description: "Study of graphs in mathematics and computer science",
    summary: "In mathematics, graph theory is the study of graphs, which are mathematical structures used to model pairwise relations between objects. A graph in this context is made up of vertices which are connected by edges.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/6n-graf.svg/320px-6n-graf.svg.png",
    links: [
      "Computer science",
      "Discrete mathematics",
      "Breadth-first search",
      "Dijkstra's algorithm",
      "Leonhard Euler",
      "Seven Bridges of Königsberg",
      "Network theory",
      "Adjacency matrix",
      "Graph traversal"
    ]
  },
  "Network theory": {
    title: "Network theory",
    category: "Mathematics",
    description: "Study of complex networks in sciences",
    summary: "Network theory is the study of graphs as a representation of either symmetric or asymmetric relations between discrete objects. In computer science and network science, network theory is a part of graph theory.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Internet_map_1024.jpg/320px-Internet_map_1024.jpg",
    links: [
      "Graph theory",
      "Small-world network",
      "Scale-free network",
      "Centrality",
      "Complex network",
      "World Wide Web",
      "Social network"
    ]
  },
  "Breadth-first search": {
    title: "Breadth-first search",
    category: "Algorithms",
    description: "Algorithm for traversing or searching tree or graph structures",
    summary: "Breadth-first search (BFS) is an algorithm for traversing or searching tree or graph data structures. It starts at the tree root (or some arbitrary node of a graph) and explores all of the neighbor nodes at the present depth prior to moving on to the nodes at the next depth level.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Breadth-First-Search-Algorithm.gif/320px-Breadth-First-Search-Algorithm.gif",
    links: [
      "Graph theory",
      "Graph traversal",
      "Dijkstra's algorithm",
      "Depth-first search",
      "Queue (abstract data type)",
      "Shortest path problem",
      "Algorithm"
    ]
  },
  "Shortest path problem": {
    title: "Shortest path problem",
    category: "Algorithms",
    description: "Problem of finding a path between two vertices in a graph",
    summary: "In graph theory, the shortest path problem is the problem of finding a path between two vertices in a graph such that the sum of the weights of its constituent edges is minimized.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Shortest_path_with_direct_weights.svg/320px-Shortest_path_with_direct_weights.svg.png",
    links: [
      "Graph theory",
      "Dijkstra's algorithm",
      "Breadth-first search",
      "Bellman–Ford algorithm",
      "A* search algorithm",
      "Computational complexity theory"
    ]
  },
  "Internet": {
    title: "Internet",
    category: "Technology",
    description: "Global system of interconnected computer networks",
    summary: "The Internet is a global system of interconnected computer networks that uses the Internet protocol suite (TCP/IP) to communicate between networks and devices. It is a network of networks that consists of private, public, academic, business, and government networks.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Internet2_map.svg/320px-Internet2_map.svg.png",
    links: [
      "World Wide Web",
      "Computer science",
      "ARPANET",
      "Internet Protocol",
      "Telecommunication",
      "Transmission Control Protocol",
      "Tim Berners-Lee",
      "Cloud computing"
    ]
  },
  "World Wide Web": {
    title: "World Wide Web",
    category: "Technology",
    description: "Information system enabling documents to be linked to other documents",
    summary: "The World Wide Web (WWW or simply the Web) is a hypermedia information system that operates over the Internet. It was invented by Sir Tim Berners-Lee in 1989 while working at CERN.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/First_Web_Server.jpg/320px-First_Web_Server.jpg",
    links: [
      "Internet",
      "Tim Berners-Lee",
      "Hypertext",
      "HTML",
      "Hypertext Transfer Protocol",
      "Web browser",
      "Wikipedia",
      "CERN"
    ]
  },
  "Tim Berners-Lee": {
    title: "Tim Berners-Lee",
    category: "People",
    description: "English computer scientist and inventor of the World Wide Web",
    summary: "Sir Timothy John Berners-Lee is an English computer scientist best known as the inventor of the World Wide Web. He is a Professorial Fellow of Computer Science at the University of Oxford and a professor at the Massachusetts Institute of Technology.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg/320px-Sir_Tim_Berners-Lee_%28cropped%29.jpg",
    links: [
      "World Wide Web",
      "Internet",
      "HTML",
      "CERN",
      "Computer science",
      "Semantic Web"
    ]
  },
  "Quantum computing": {
    title: "Quantum computing",
    category: "Physics & CS",
    description: "Computation using quantum mechanical phenomena",
    summary: "Quantum computing is a rapidly-emerging technology that harnesses the laws of quantum mechanics to solve problems too complex for classical computers. It utilizes quantum bits or qubits that can exist in superpositions of states.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Quantum_computer_chassis.jpg/320px-Quantum_computer_chassis.jpg",
    links: [
      "Quantum mechanics",
      "Computer science",
      "Qubit",
      "Quantum algorithm",
      "Superposition principle",
      "Quantum entanglement",
      "Shor's algorithm",
      "Theoretical physics"
    ]
  },
  "Quantum mechanics": {
    title: "Quantum mechanics",
    category: "Physics",
    description: "Fundamental theory in physics",
    summary: "Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. It is the foundation of all quantum physics including quantum chemistry and quantum field theory.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Hydrogen_Density_Plots.png/320px-Hydrogen_Density_Plots.png",
    links: [
      "Quantum computing",
      "Theoretical physics",
      "Superposition principle",
      "Quantum entanglement",
      "Albert Einstein",
      "Niels Bohr",
      "Wave function",
      "Werner Heisenberg"
    ]
  },
  "Albert Einstein": {
    title: "Albert Einstein",
    category: "Physics",
    description: "German-born theoretical physicist",
    summary: "Albert Einstein was a German-born theoretical physicist who is widely held to be one of the greatest and most influential scientists of all time. Best known for developing the theory of relativity, he also made important contributions to quantum mechanics.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/320px-Albert_Einstein_Head.jpg",
    links: [
      "General relativity",
      "Special relativity",
      "Quantum mechanics",
      "Theoretical physics",
      "Photoelectric effect",
      "Speed of light",
      "Niels Bohr"
    ]
  },
  "Algorithm": {
    title: "Algorithm",
    category: "Computer Science",
    description: "Finite sequence of rigorous instructions",
    summary: "In mathematics and computer science, an algorithm is a finite sequence of rigorous instructions, typically used to solve a class of specific problems or to perform a computation.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Flowchart_example.svg/320px-Flowchart_example.svg.png",
    links: [
      "Computer science",
      "Alan Turing",
      "Turing machine",
      "Data structure",
      "Computational complexity theory",
      "Breadth-first search",
      "Dijkstra's algorithm",
      "Mathematics"
    ]
  },
  "Philosophy of mind": {
    title: "Philosophy of mind",
    category: "Philosophy",
    description: "Branch of philosophy that studies the mind and consciousness",
    summary: "Philosophy of mind is a branch of philosophy that investigates the nature of consciousness and mind, especially their relationship to the physical body, particularly the brain. Central topics include the mind-body problem and mental states.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Phrenology.jpg/320px-Phrenology.jpg",
    links: [
      "Artificial intelligence",
      "Consciousness",
      "Cognitive science",
      "Dualism (philosophy of mind)",
      "Alan Turing",
      "Philosophy",
      "Functionalism (philosophy of mind)"
    ]
  },
  "Discrete mathematics": {
    title: "Discrete mathematics",
    category: "Mathematics",
    description: "Study of mathematical structures that are fundamentally discrete",
    summary: "Discrete mathematics is the study of mathematical structures that are fundamentally discrete rather than continuous. Objects studied include integers, graphs, and statements in logic.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Complete_graph_K5.svg/320px-Complete_graph_K5.svg.png",
    links: [
      "Graph theory",
      "Combinatorics",
      "Logic",
      "Computer science",
      "Set theory",
      "Number theory"
    ]
  },
  "Wikipedia": {
    title: "Wikipedia",
    category: "Technology",
    description: "Free online encyclopedia",
    summary: "Wikipedia is a free, multilingual online encyclopedia written and maintained by a community of volunteers through open collaboration and using a wiki-based editing system.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/320px-Wikipedia-logo-v2.svg.png",
    links: [
      "World Wide Web",
      "Internet",
      "Hypertext",
      "Wiki",
      "Open source",
      "Encyclopedia"
    ]
  }
};

export const CATEGORY_COLORS: Record<string, string> = {
  "Computer Science": "#38bdf8",     // sky
  "Theoretical CS": "#818cf8",       // indigo
  "Algorithms": "#a855f7",           // purple
  "Mathematics": "#ec4899",           // pink
  "Physics": "#f59e0b",               // amber
  "Physics & CS": "#f97316",          // orange
  "Technology": "#10b981",           // emerald
  "Philosophy": "#14b8a6",           // teal
  "People": "#e11d48",               // rose
  "Default": "#94a3b8"               // slate
};

export function inferCategory(title: string, summary?: string): string {
  const text = (title + " " + (summary || "")).toLowerCase();
  
  if (text.includes("algorithm") || text.includes("search") || text.includes("traversal") || text.includes("sorting")) {
    return "Algorithms";
  }
  if (text.includes("machine learning") || text.includes("artificial intelligence") || text.includes("neural") || text.includes("deep learning") || text.includes("computer science") || text.includes("software") || text.includes("turing")) {
    return "Computer Science";
  }
  if (text.includes("quantum") || text.includes("physics") || text.includes("relativity") || text.includes("einstein") || text.includes("particle") || text.includes("mechanics")) {
    return "Physics";
  }
  if (text.includes("math") || text.includes("graph theory") || text.includes("discrete") || text.includes("geometry") || text.includes("algebra") || text.includes("calculus") || text.includes("topology")) {
    return "Mathematics";
  }
  if (text.includes("philosophy") || text.includes("consciousness") || text.includes("epistemolog") || text.includes("ethics") || text.includes("mind")) {
    return "Philosophy";
  }
  if (text.includes("web") || text.includes("internet") || text.includes("network") || text.includes("protocol") || text.includes("hardware") || text.includes("technology")) {
    return "Technology";
  }
  if (text.includes("mathematician") || text.includes("physicist") || text.includes("scientist") || text.includes("inventor") || text.includes("born")) {
    return "People";
  }
  return "Technology";
}
