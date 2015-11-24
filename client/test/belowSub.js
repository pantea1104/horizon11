belowSubscriptionSuite = (getData) => {
  return () => {

  var data;

  before(() => {
    data = getData();
  });

  // Let's grab a specific document using `below`
  it("#.below(id, [added, removed])", (done) => {
    var query = data.below({id: 2}).subscribe();
    var x = observe(query,
      ['added', 'removed']);

    var ops = Promise.all([
      data.store({ id: 1, a: 1 }),
      data.store({ id: 1, a: 2 }),
      data.remove(1)]);

    x.expect(ops,
      [{type: 'added', a: 1, id: 1},
       {type: 'removed', a: 1, id: 1},
       {type: 'added', a: 2, id: 1},
       {type: 'removed', a: 2, id: 1}],
      done);
  });

  // Let's grab a specific document using `below` and also test the `changed`
  // event.
  it("#.below(id, [added, removed, changed])", (done) => {
    var query = data.below({id: 2}).subscribe();
    var x = observe(query,
      ['added', 'removed', 'changed']);

    var ops = Promise.all([
      data.store({ id: 1, a: 1 }),
      data.store({ id: 1, a: 2 }),
      data.remove(1)]);

    x.expect(ops,
      [{type: 'added', a: 1, id: 1},
       {type: 'changed',
        old: {id: 1, a: 1},
        new: {id: 1, a: 2}},
       {type: 'removed', a: 2, id: 1}],
      done);
  });

  // Secondary index, closed
  it("#.below(a, closed, [added, removed, changed])", (done) => {
    var query = data.below({a: 2}, 'closed').subscribe();
    var x = observe(query,
      ['added', 'removed', 'changed']);

    var ops = Promise.all([
      data.store({ id: 1, a: 1 }),
      data.store({ id: 1, a: 2 }),
      data.remove(1)]);

    x.expect(ops,
      [{type: 'added', a: 1, id: 1},
       {type: 'changed',
        old: {id: 1, a: 1},
        new: {id: 1, a: 2}},
       {type: 'removed', a: 2, id: 1}],
      done);
  });

  // Let's make sure we don't see events that aren't ours
  it("#.below(id):store(different_id)", (done) => {
    var query = data.below({id: 1}).subscribe();
    var x = observe(query,
      ['added', 'removed']);

    var ops = Promise.all([
      data.store({ id: 2, a: 1 }),
      data.store({ id: 2, a: 2 }),
      data.remove(2)]);

    x.expect(ops, [], done);
  });

  // Let's try subscribing to multiple IDs
  it("#.below(id, id2, [added, removed, changed])", (done) => {
    var query = data.below({id: 3}).subscribe();
    var x = observe(query,
      ['added', 'removed', 'changed']);

    var ops = inSeries([
      () => { return data.store({ id: 1, a: 1 }) },
      () => { return data.store({ id: 2, a: 1 }) },
      () => { return data.store({ id: 3, a: 1 }) },
      () => { return data.store({ id: 1, a: 2 }) },
      () => { return data.store({ id: 2, a: 2 }) },
      () => { return data.store({ id: 3, a: 2 }) },
      () => { return data.remove(1) },
      () => { return data.remove(2) },
      () => { return data.remove(3) }]);

    x.expect(ops,
      [{type: 'added', id: 1, a: 1},
       {type: 'added', id: 2, a: 1},
       {type: 'changed',
        old: {id: 1, a: 1},
        new: {id: 1, a: 2}},
       {type: 'changed',
        old: {id: 2, a: 1},
        new: {id: 2, a: 2}},
       {type: 'removed', id: 1, a: 2},
       {type: 'removed', id: 2, a: 2}],
      done);
  });

  // Let's make sure initial vals works correctly
  it("#.below(initial+id, [added, removed])", (done) => {
    data.store({ id: 1, a: 1 }).then((res) => {
      var query = data.below({id: 2}).subscribe();
      var x = observe(query,
        ['added', 'removed']);

      var ops = Promise.all([
        data.store({ id: 1, a: 2 }),
        data.remove(1)]);

      x.expect(ops,
        [{type: 'added', a: 1, id: 1},
         {type: 'removed', a: 1, id: 1},
         {type: 'added', a: 2, id: 1},
         {type: 'removed', a: 2, id: 1}],
        done);
    });
  });

  } // Testing `below` subscriptions
}