/* ============== LEVEL DATA ============== */
// Word bank items can be distractors (wrong) or correct, marked per blank.
const LEVELS = [
{
  id:1, title:"Earthquake Alley", ground:"quake", concept:"def — defining a function",
  story:"A tremor just hit Block 9! A dog named Biscuit is trapped under rubble. Robots don't know how to help yet — we need to TEACH one using def.",
  tutorial:"`def` is short for DEFINE. You're inventing a brand-new word that Python will understand — just like adding a new word to a dictionary! Every function starts with def, a name, parentheses (), and a colon :",
  codeLines:[
    {parts:[{t:'kw',v:'def'},{t:'sp'},{fn:true,blank:'fnname',v:'rescue_dog'},{t:'plain',v:'():'}]},
    {indent:true, parts:[{t:'kw',v:'print'},{t:'plain',v:'('},{t:'str',v:'"Biscuit is safe!"'},{t:'plain',v:')'}]},
    {parts:[{blank:'call',v:'rescue_dog'},{t:'plain',v:'()'}]}
  ],
  blanks:[
    {id:'fnname', answer:'rescue_dog', options:['rescue_dog','dog_rescue()','RescueDog']},
    {id:'call', answer:'rescue_dog', options:['rescue_dog','call rescue_dog','dog_rescue']}
  ],
  hint:"Tip: the function name in the def line must match the name you use to call it later!",
  civilians:[{name:'Biscuit the dog', x:62, emoji:'🐶'}],
  successText:"Biscuit is rescued! You defined your very first function and called it to run.",
  successFact:"📻 \"def creates the function. Calling it with () is what actually RUNS it. No call = nothing happens!\""
},
{
  id:2, title:"Smoke on the Block", ground:"fire", concept:"Parameters",
  story:"Apartment 4B is filling with smoke! Tell the robot WHERE to go using a parameter.",
  tutorial:"The words inside the parentheses are PARAMETERS — like blanks in Mad Libs! The function needs you to fill them in so it knows exactly what to do.",
  codeLines:[
    {parts:[{t:'kw',v:'def'},{t:'sp'},{t:'fn',v:'rescue_person'},{t:'plain',v:'('},{blank:'param',v:'location'},{t:'plain',v:'):'}]},
    {indent:true, parts:[{t:'kw',v:'print'},{t:'plain',v:'("Heading to "+'},{blank:'param2',v:'location'},{t:'plain',v:')'}]},
    {parts:[{t:'fn',v:'rescue_person'},{t:'plain',v:'('},{blank:'arg',v:'"Apartment 4B"'},{t:'plain',v:')'}]}
  ],
  blanks:[
    {id:'param', answer:'location', options:['location','"location"','Location()']},
    {id:'param2', answer:'location', options:['location','"location"','place']},
    {id:'arg', answer:'"Apartment 4B"', options:['"Apartment 4B"','Apartment 4B','location']}
  ],
  hint:"Tip: parameters go in the def() line WITHOUT quotes. When you CALL the function, you give the real value (often with quotes for text!).",
  civilians:[{name:'Resident', x:55, emoji:'🧑'}],
  successText:"The robot found Apartment 4B using the location parameter you defined!",
  successFact:"📻 \"Parameters are placeholders. Arguments are the real values you hand over when calling. location is the placeholder, \\\"Apartment 4B\\\" is the argument!\""
},
{
  id:3, title:"Flooded Street", ground:"flood", concept:"Multiple parameters",
  story:"Waters are rising on Maple Street! A kitten is stuck on a roof — send a robot with the RIGHT tool.",
  tutorial:"Functions can take MORE than one parameter! Just separate them with a comma: def rescue_cat(location, tool):  Now you fill in TWO blanks every time you call it.",
  codeLines:[
    {parts:[{t:'kw',v:'def'},{t:'sp'},{t:'fn',v:'rescue_cat'},{t:'plain',v:'(location, '},{blank:'param',v:'tool'},{t:'plain',v:'):'}]},
    {indent:true, parts:[{t:'kw',v:'print'},{t:'plain',v:'("Using "+tool+" at "+location)'}]},
    {parts:[{t:'fn',v:'rescue_cat'},{t:'plain',v:'('},{blank:'arg1',v:'"rooftop"'},{t:'plain',v:', '},{blank:'arg2',v:'"boat"'},{t:'plain',v:')'}]}
  ],
  blanks:[
    {id:'param', answer:'tool', options:['tool','"tool"','equipment=true']},
    {id:'arg1', answer:'"rooftop"', options:['"rooftop"','rooftop','tool']},
    {id:'arg2', answer:'"boat"', options:['"boat"','boat','location']}
  ],
  hint:"Tip: arguments fill parameters IN ORDER — first argument → first parameter, second → second.",
  civilians:[{name:'Kitten', x:60, emoji:'🐱'}],
  successText:"Robot grabbed the boat and reached the rooftop — kitten saved!",
  successFact:"📻 \"Order matters! rescue_cat(\\\"boat\\\",\\\"rooftop\\\") would send the robot to a place called BOAT. Always match the order!\""
},
{
  id:4, title:"Mad Libs Rescue", ground:"flood", concept:"Reusing functions with different arguments",
  story:"Three more pets need saving — same function, different details each time! Fill in fresh arguments for each call.",
  tutorial:"This is the real power of functions — write the code ONCE, then call it again and again with different arguments to get different results. Just like filling in new words for a new Mad Lib!",
  codeLines:[
    {parts:[{t:'kw',v:'def'},{t:'sp'},{t:'fn',v:'rescue_pet'},{t:'plain',v:'(name, location):'}]},
    {indent:true, parts:[{t:'kw',v:'print'},{t:'plain',v:'(name+" saved at "+location)'}]},
    {parts:[{t:'fn',v:'rescue_pet'},{t:'plain',v:'('},{blank:'a1',v:'"Biscuit"'},{t:'plain',v:', "yard")'}]},
    {parts:[{t:'fn',v:'rescue_pet'},{t:'plain',v:'('},{blank:'a2',v:'"Whiskers"'},{t:'plain',v:', "tree")'}]}
  ],
  blanks:[
    {id:'a1', answer:'"Biscuit"', options:['"Biscuit"','Biscuit','name']},
    {id:'a2', answer:'"Whiskers"', options:['"Whiskers"','Whiskers','location']}
  ],
  hint:"Tip: Same function, different arguments = different results. That's reusability!",
  civilians:[{name:'Biscuit', x:30, emoji:'🐶'},{name:'Whiskers', x:70, emoji:'🐱'}],
  successText:"Two pets, one function, two rescues!",
  successFact:"📻 \"You just learned why functions save SO much time — write once, call many times!\""
},
{
  id:5, title:"Bring It Back", ground:"quake", concept:"return",
  story:"A survivor named Mateo is found in the rubble — but the robot needs to REPORT it back to base using return.",
  tutorial:"`return` is like the robot coming back and handing you what it found! Without return, the robot keeps the discovery to itself and base never finds out.",
  codeLines:[
    {parts:[{t:'kw',v:'def'},{t:'sp'},{t:'fn',v:'find_survivor'},{t:'plain',v:'():'}]},
    {indent:true, parts:[{blank:'ret',v:'return'},{t:'plain',v:' "Mateo"'}]},
    {parts:[{t:'plain',v:'name = '},{t:'fn',v:'find_survivor'},{t:'plain',v:'()'}]},
    {parts:[{t:'kw',v:'print'},{t:'plain',v:'('},{blank:'use',v:'name'},{t:'plain',v:')'}]}
  ],
  blanks:[
    {id:'ret', answer:'return', options:['return','print','give']},
    {id:'use', answer:'name', options:['name','"name"','find_survivor']}
  ],
  hint:"Tip: return SENDS a value out of the function so you can store it (like in the variable 'name') and use it later.",
  civilians:[{name:'Mateo', x:50, emoji:'🧑‍🦰'}],
  successText:"Mateo's name was returned and reported to base — rescue confirmed!",
  successFact:"📻 \"return hands data back to whoever called the function. That's how the function's work becomes USEFUL outside itself!\""
},
{
  id:6, title:"Empty-Handed Bot", ground:"fire", concept:"Missing return (debugging)",
  story:"A robot rescued someone but came back with NOTHING to report — the print shows 'None'! Fix the bug by adding return.",
  tutorial:"If a function doesn't use return, Python quietly gives back `None` — basically 'nothing'. That's a common bug! Always return the value you want to use later.",
  codeLines:[
    {parts:[{t:'kw',v:'def'},{t:'sp'},{t:'fn',v:'find_survivor'},{t:'plain',v:'():'}]},
    {indent:true, parts:[{t:'plain',v:'result = "Priya"'}]},
    {indent:true, parts:[{blank:'fix',v:'return'},{t:'plain',v:' result'}]},
    {parts:[{t:'plain',v:'who = '},{t:'fn',v:'find_survivor'},{t:'plain',v:'()'}]},
    {parts:[{t:'kw',v:'print'},{t:'plain',v:'(who)  '},{t:'docstr',v:'# was printing None, now fixed!'}]}
  ],
  blanks:[
    {id:'fix', answer:'return', options:['return','print','None']}
  ],
  hint:"Tip: without 'return result', the function finishes but hands nothing back — 'who' would be None.",
  civilians:[{name:'Priya', x:50, emoji:'🧑‍🦱'}],
  successText:"Bug fixed! The robot now correctly reports Priya as rescued instead of None.",
  successFact:"📻 \"A function with no return doesn't crash — it just silently returns None. Sneaky bug, easy fix!\""
},
{
  id:7, title:"Chain Reaction", ground:"fire", concept:"Function chaining",
  story:"Big rescue! The robot must find the survivor, give aid, AND return to base — three functions, one mission.",
  tutorial:"You can CHAIN functions — call one after another in order, like a checklist: find_survivor() → give_aid() → return_to_base(). Each step happens in the order you write it!",
  codeLines:[
    {parts:[{blank:'s1',v:'find_survivor'},{t:'plain',v:'()'}]},
    {parts:[{blank:'s2',v:'give_aid'},{t:'plain',v:'()'}]},
    {parts:[{blank:'s3',v:'return_to_base'},{t:'plain',v:'()'}]}
  ],
  blanks:[
    {id:'s1', answer:'find_survivor', options:['find_survivor','give_aid','return_to_base']},
    {id:'s2', answer:'give_aid', options:['give_aid','find_survivor','return_to_base']},
    {id:'s3', answer:'return_to_base', options:['return_to_base','give_aid','find_survivor']}
  ],
  hint:"Tip: order matters in a chain! You can't give aid before you've found the survivor.",
  civilians:[{name:'Survivor', x:50, emoji:'🧑‍🚒'}],
  successText:"Perfect chain! Found → treated → returned to base, in the right order.",
  successFact:"📻 \"Chaining functions lets you break a big mission into small, reusable steps!\""
},
{
  id:8, title:"Docstring Detective", ground:"quake", concept:"Docstrings",
  story:"Another robot on the squad can't tell what your function does! Add a docstring so any teammate understands it instantly.",
  tutorial:"A docstring is a note in triple quotes right under def — \"\"\"what this function does\"\"\". It doesn't run any code, it just explains the function to humans (and robots)!",
  codeLines:[
    {parts:[{t:'kw',v:'def'},{t:'sp'},{t:'fn',v:'rescue_elder'},{t:'plain',v:'(location):'}]},
    {indent:true, parts:[{blank:'doc',v:'"""Guides an elder safely out of a shaking building."""'}]},
    {indent:true, parts:[{t:'kw',v:'print'},{t:'plain',v:'("Guiding to safety at "+location)'}]},
    {parts:[{t:'fn',v:'rescue_elder'},{t:'plain',v:'("Block 9")'}]}
  ],
  blanks:[
    {id:'doc', answer:'"""Guides an elder safely out of a shaking building."""', options:['"""Guides an elder safely out of a shaking building."""','# Guides an elder out','Guides an elder out of a building']}
  ],
  hint:"Tip: real docstrings use THREE double-quotes on each side: \"\"\" like this \"\"\"",
  civilians:[{name:'Elder', x:50, emoji:'🧓'}],
  successText:"Now every robot on the squad knows exactly what rescue_elder() does!",
  successFact:"📻 \"Docstrings are like sticky notes for your code — future you (and your teammates) will thank you!\""
},
{
  id:9, title:"Multi-Bot Mission", ground:"flood", concept:"Default parameter values",
  story:"Three robots, one flood zone! Give rescue_dog a DEFAULT tool so you don't have to specify it every time.",
  tutorial:"You can give a parameter a DEFAULT value: def rescue_dog(location, tool=\"rope\"): If you don't say which tool, Python automatically uses \"rope\"!",
  codeLines:[
    {parts:[{t:'kw',v:'def'},{t:'sp'},{t:'fn',v:'rescue_dog'},{t:'plain',v:'(location, tool='},{blank:'def1',v:'"rope"'},{t:'plain',v:'):'}]},
    {indent:true, parts:[{t:'kw',v:'print'},{t:'plain',v:'("Using "+tool+" at "+location)'}]},
    {parts:[{t:'fn',v:'rescue_dog'},{t:'plain',v:'('},{blank:'call1',v:'"dock"'},{t:'plain',v:')  '},{t:'docstr',v:'# uses default rope'}]},
    {parts:[{t:'fn',v:'rescue_dog'},{t:'plain',v:'("pier", '},{blank:'call2',v:'"boat"'},{t:'plain',v:')  '},{t:'docstr',v:'# overrides default'}]}
  ],
  blanks:[
    {id:'def1', answer:'"rope"', options:['"rope"','rope','None']},
    {id:'call1', answer:'"dock"', options:['"dock"','dock','tool']},
    {id:'call2', answer:'"boat"', options:['"boat"','boat','location']}
  ],
  hint:"Tip: defaults are optional — skip the argument to use the default, or supply your own to override it.",
  civilians:[{name:'Dog 1', x:30, emoji:'🐕'},{name:'Dog 2', x:70, emoji:'🐩'}],
  successText:"Both rescues complete — one used the default rope, one used a boat instead!",
  successFact:"📻 \"Default values make functions flexible — usable with fewer arguments when the common case applies!\""
},
{
  id:10, title:"City-Wide Save", ground:"fire", concept:"Full review — def, params, return, chaining",
  story:"FINAL MISSION. The whole city needs saving. Put EVERYTHING together: define, call with parameters, return a result, and chain the steps.",
  tutorial:"This is the big one! Use everything you've learned: def with parameters, a return statement, and a chain of calls in the right order. You've got this, Commander!",
  codeLines:[
    {parts:[{t:'kw',v:'def'},{t:'sp'},{t:'fn',v:'rescue_city'},{t:'plain',v:'(location):'}]},
    {indent:true, parts:[{blank:'r1',v:'return'},{t:'plain',v:' "All civilians safe at "+location'}]},
    {parts:[{t:'plain',v:'report = '},{t:'fn',v:'rescue_city'},{t:'plain',v:'('},{blank:'arg',v:'"Downtown"'},{t:'plain',v:')'}]},
    {parts:[{t:'kw',v:'print'},{t:'plain',v:'('},{blank:'final',v:'report'},{t:'plain',v:')'}]}
  ],
  blanks:[
    {id:'r1', answer:'return', options:['return','print','call']},
    {id:'arg', answer:'"Downtown"', options:['"Downtown"','Downtown','location']},
    {id:'final', answer:'report', options:['report','"report"','rescue_city']}
  ],
  hint:"Tip: you're combining def + parameter + return + calling + printing the returned value. One step at a time!",
  civilians:[{name:'Whole City', x:30, emoji:'🧑'},{name:'', x:50, emoji:'🧑‍🦱'},{name:'', x:70, emoji:'🧑‍🦳'}],
  successText:"THE CITY IS SAVED! Every concept, working together perfectly.",
  successFact:"📻 \"You just wrote a complete real-world function pattern: define → parameterize → return → call → use. That's professional Python!\""
}
];

