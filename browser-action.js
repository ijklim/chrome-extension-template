// console.log('Running browser-action.js');

const app = {
  setup() {
    const { ref } = Vue;

    const currentTime = ref((new Date()).toLocaleString());

    setInterval(() => {
      currentTime.value = (new Date()).toLocaleString();
    }, 1000);

    return { currentTime };
  },

  template: `
    The time is {{ currentTime }}
  `,
};

const { createApp } = Vue;
createApp(app).mount(`#app`);
