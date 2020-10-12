# Merge Insertion Sort

def merge_insertion(elements):
  print("====")
  print("sorting {}".format(elements))
  print("====")
  # Base Cases
  
  if len(elements) == 1:
    return elements
  
  if len(elements) == 2:
    if compare_elements(elements[0], elements[1]) > 0:
      return [elements[1], elements[0]]
    else:
      return elements

  # Separate into pairs
  
  pairs = []
  for i in range(len(elements) // 2):
    pairs.append(elements[2 * i:2 * i + 2])
  if len(elements) % 2 == 1:
    pairs.append([elements[-1]])
  
  print(pairs)
  
  # Sort within pair
  
  ranked_pairs = {}
  
  for pair in pairs:
    if len(pair) == 2 and compare_elements(pair[0], pair[1]) > 0:
      ranked_pairs[pair[0]] = [pair[1], pair[0]]
    else:
      ranked_pairs[pair[-1]] = pair

  print("ranked pairs")
  print(ranked_pairs)

  # Sort winners of each pair
  sorted_winners = merge_insertion([w for w in ranked_pairs])
  
  # Insert losers into winners

  print("inserting losers into {}".format(sorted_winners))
  sorted = ranked_pairs[sorted_winners[0]]
  for i in range(1, len(sorted_winners)):
    winner = sorted_winners[i]
    if len(ranked_pairs[winner]) == 2:
      print("inserting {} into {}".format(ranked_pairs[winner][0], sorted))
      insert(ranked_pairs[winner][0], sorted)
    sorted.append(winner)
  
  return sorted

def compare_elements(a, b):
  print("Compare")
  print("\ta) {}".format(a))
  print("\tb) {}".format(b))
  aorb = input("Which ranks higher: a or b? ")
  if aorb == "a":
    return 1
  return -1


# TODO Make this use binary insert

def insert(el, list):
  for i in range(len(list)):
    if compare_elements(el, list[i]) < 0:
      list.insert(i, el)
      return
  list.append(el)

print(merge_insertion(["Coke","Sprite", "Root Beer", "Mt. Dew", "Squirt", "Dr. Pepper", "Fanta", "Ramune"]))