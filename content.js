let toHTMLTable = (/* array of comment groups */ commentGroups) => {
  const tableBody = document.createElement("tbody");
  for (i of commentGroups.flat()) tableBody.appendChild(i);

  return tableBody;
};

let shuffleTree = (/* array of comments */ comments) => {
  let treeGroups = groupComments(comments);

  for (let i = treeGroups.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [treeGroups[i], treeGroups[j]] = [treeGroups[j], treeGroups[i]];
  }

  return toHTMLTable(treeGroups);
};

let commentTreePath = (/* true for DOM parent node */ parent) => {
  const commentTree = document.getElementsByClassName("comment-tree")[0];
  return parent === true
    ? commentTree /* table */
    : commentTree.childNodes[1]; /* tbody */
};

let groupComments = (comments) => {
  let commentGroups = [];
  let commentGroupIndex;

  for (i of comments) {
    let indent = i.getElementsByClassName("ind")[0].getAttribute("indent");

    if (indent === "0") {
      commentGroupIndex = commentGroups.push([i]);
    } else {
      commentGroups[commentGroupIndex - 1].push(i);
    }
  }

  return commentGroups;
};

const defaultCommentArray = (() => {
  commentNodes = commentTreePath((parent = false));
  // HTMLCollection of <tr> comments
  return commentNodes ? Array.from(commentNodes.children) : null;
})();

let shuffleCommentTree = () => {
  const newTree = shuffleTree(defaultCommentArray); /* tbody element */
  const table = commentTreePath((parent = true));
  table.replaceChild(newTree, commentTreePath((parent = false)));
};

let unshuffleCommentTree = () => {
  const defaultTree = toHTMLTable(defaultCommentArray);
  const table = commentTreePath((container = true));
  table.replaceChild(defaultTree, commentTreePath((container = false)));
};

// const port = browser.runtime.connect({ name: "port-from-cs" });
browser.runtime.onMessage.addListener((message) => {
  // if tbody is not in node list
  if (defaultCommentArray !== null) {
    if (message.command) {
      console.log("shuffle comments");
      shuffleCommentTree();
    } else {
      console.log("unshuffle comments");
      unshuffleCommentTree();
    }
  } else {
    // do not communicate to background script
    // port.postMessage({ status: false });
    console.log("no comments to shuffle");
  }
});
