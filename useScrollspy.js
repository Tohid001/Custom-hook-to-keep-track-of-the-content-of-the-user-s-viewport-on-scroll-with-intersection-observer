import { useState, useRef, useEffect } from "react";

export function useScrollspy(elements, options) {
  const [currentIntersectingElementIndex, setCurrentIntersectingElementIndex] =
    useState(-1);

  //***
  const intersectionObserver = useRef(null);

  useEffect(() => {
    //if the target elements passed as argument get changed, our effect will run again(see the dependancy array) and we'll start keeping track of the new elements which is great! But... we didn't stop keeping track of the older elements (since we didn't unmount). Thus to avoid this scenario from breaking our app, the best thing to do is to check for any existing Intersection Observers currently instantiated and disconnect them every time our effect runs
    if (intersectionObserver.current) {
      intersectionObserver.current.disconnect();
    }

    /**Firstly,we need to wrap our Intersection Observer in a useRef Hook. This way we can keep track of the state of any intersection across rerenders and also if we were to update our Intersection Observer, we would not trigger a rerender.
    
    Secondly, we are doing it inside useEffect hook because if the options passed as argument get changed it won't update our Intersection Observer as our intersection observer is wrapped in  useRef. So we simply set useRef as null first like we did immediately before useEffect.Then after disconnecting any pre-existing Intersection Oservers which we have already in preceding statement, we create a new one with the current set of options and point the current value of the ref to it.Then finally,We make sure to pass the options in the dependency array of our useEffect Hook so any change in options will disconnect the old observer and create a new one with the latest set of options.**/
    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        // find the index of the fist element that is currently intersecting. The reason why I didn't use forEach method bacuse I want only one element(which is the first element) to get highlighted if 2 or more elements intersect at the same time.
        const indexOfElementIntersecting = entries.findIndex((entry) => {
          return entry.intersectionRatio > 0; // if intersection > 0 it means entry is intersecting with the view port
        });

        setCurrentIntersectingElementIndex(indexOfElementIntersecting); // store the value of indexOfElementIntersecting. Even though we may be calling set state over and over in that callback it will not impact performance since most of the time we'll be setting the same value that is already in the state.
      },
      {
        root: (options && options.root) || null, //set a custom parent element that is not the main viewport

        rootMargin: `-${(options && options.offset) || 0}px 0px 0px 0px`, // use this option to handle custom offset
      }
    );

    const { current: ourObserver } = intersectionObserver; //accessing current directly to observe and disconnect  our Intersection Observer while unmounting is not safe. The current we access on mount is not guaranteed to be the same when unmounting (remember, we can update the ref without triggering a rerender)

    elements.forEach((element) =>
      element ? ourObserver.observe(element) : null
    ); // observe all the elements passed as argument of the hook

    return () => ourObserver.disconnect(); //disconnecting intersection observer while unmounting
  }, [elements, options]);

  return [currentIntersectingElementIndex];
}
